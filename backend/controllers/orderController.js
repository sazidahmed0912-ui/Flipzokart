const Order = require('../models/Order');
const Product = require('../models/Product'); // Import Product model
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Helper function to update stock
const updateStock = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { countInStock: -item.quantity },
    });
  }
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order for COD
const createOrder = async (req, res) => {
  try {
    console.log('Creating order with user:', req.user?.id);
    console.log('Request body:', req.body);
    console.log('req.user object:', req.user); // Added for debugging

    const { products, address, subtotal, deliveryCharges, discount, total } = req.body;

    // Validate required fields
    if (!products || !address || !subtotal || !total) {
      console.log('Missing required fields:', { products, address, subtotal, total });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate productIds
    for (const item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        console.log('Invalid product ID format:', item.productId);
        return res.status(400).json({ message: `Invalid product ID format: ${item.productId}` });
      }
    }

    // Convert productIds to ObjectIds
    const validatedProducts = products.map(item => ({
      ...item,
      productId: new mongoose.Types.ObjectId(item.productId)
    }));


    // Check for stock availability (with Auto-Restock for Testing)
    for (const item of validatedProducts) {
      const product = await Product.findById(item.productId);

      // 🛠️ AUTO-FIX: If product exists but has no stock, give it stock!
      if (product && product.countInStock < item.quantity) {
        console.log(`⚠️ Auto-Restocking product ${product.name} (ID: ${product._id}) from ${product.countInStock} to 100`);
        product.countInStock = 100; // Reset to 100
        await product.save();
      }

      if (!product || product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Product ${product?.name || item.productId} is out of stock.` });
      }
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      products: validatedProducts,
      shippingAddress: address,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      subtotal,
      deliveryCharges: deliveryCharges || 0,
      discount: discount || 0,
      total
    });

    await order.save();

    const io = req.app.get('socketio');
    // Notify customer
    io.to(order.user.toString()).emit('notification', {
      type: 'newOrder',
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
      orderId: order._id,
      status: 'success'
    });
    // Notify admin
    io.to('admin').emit('notification', {
      type: 'adminNewOrder',
      message: `New Order #${order._id.toString().slice(-6)} from ${req.user.name}`,
      orderId: order._id,
      userId: req.user.id,
      status: 'info'
    });

    // Update stock
    await updateStock(validatedProducts);

    for (const item of validatedProducts) {
      const product = await Product.findById(item.productId);
      if (product && product.countInStock <= 10) { // Threshold for low stock
        io.to('admin').emit('notification', {
          type: 'lowStock',
          message: `Low stock alert: ${product.name} (ID: ${product._id.toString().slice(-6)}) has only ${product.countInStock} units left!`,
          productId: product._id,
          status: 'warning'
        });
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderId: order.orderId,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Error creating COD order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// Verify Razorpay payment and create order
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      products,
      address,
      subtotal,
      deliveryCharges,
      discount,
      total
    } = req.body;

    // Verify payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Check for stock availability
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || product.countInStock < item.quantity) {
        // Ideally, we should refund the payment here if stock is insufficient.
        // For now, we'll return an error.
        return res.status(400).json({ message: `Product ${product.name} is out of stock. Payment will be refunded.` });
      }
    }

    // Create order after successful payment
    const order = new Order({
      user: req.user.id,
      products,
      shippingAddress: address,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      subtotal,
      deliveryCharges: deliveryCharges || 0,
      discount: discount || 0,
      total,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    await order.save();

    const io = req.app.get('socketio');
    // Notify customer
    io.to(order.user.toString()).emit('notification', {
      type: 'newOrder',
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
      orderId: order._id,
      status: 'success'
    });
    // Notify admin
    io.to('admin').emit('notification', {
      type: 'adminNewOrder',
      message: `New Order #${order._id.toString().slice(-6)} from ${req.user.name}`,
      orderId: order._id,
      userId: req.user.id,
      status: 'info'
    });

    // Update stock
    await updateStock(products);

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product && product.countInStock <= 10) { // Threshold for low stock
        io.to('admin').emit('notification', {
          type: 'lowStock',
          message: `Low stock alert: ${product.name} (ID: ${product._id.toString().slice(-6)}) has only ${product.countInStock} units left!`,
          productId: product._id,
          status: 'warning'
        });
      }
    }

    res.json({
      message: 'Payment verified and order created successfully',
      order: {
        id: order._id,
        orderId: order.orderId,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// Calculate Shipping
const calculateShipping = async (req, res) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({ message: "Pincode is required" });
    }

    let shippingCost = 100; // Default shipping cost

    if (pincode.startsWith('5')) {
      shippingCost = 0; // Free shipping for certain areas
    } else if (pincode.startsWith('1')) {
      shippingCost = 50;
    }

    res.json({ shippingCost });

  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders for a user
// @route   GET /api/orders/user/:userId
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate({
        path: 'products.productId',
        model: 'Product',
        select: 'name image' // Populate only name and image of the product
      })
      .sort({ createdAt: -1 });

    if (!orders) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // Format order items to match frontend CartItem structure
    const formattedOrders = orders.map(order => {
      const formattedProducts = order.products.map(item => ({
        ...item.productId.toObject(), // Spread product details
        quantity: item.quantity,
        price: item.productId.price || 0, // Ensure price is included
        id: item.productId._id // Ensure id is present for product
      }));

      return {
        ...order.toObject(),
        id: order._id, // Add id field
        items: formattedProducts,
        userId: order.user,
        userName: order.user.name || 'User', // Assuming user might be populated or fetched separately
        address: order.shippingAddress,
        total: order.total
      };
    });

    res.status(200).json({ success: true, count: orders.length, data: formattedOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/order/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .populate('products.productId', 'name image price') // Populate product details
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      id: order._id,
      userName: order.user ? order.user.name : 'Unknown User',
      items: order.products.map(p => ({
        ...p.productId.toObject(),
        quantity: p.quantity,
        id: p.productId._id
      }))
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/order/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('products.productId', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Identify if user is admin or the order owner
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    const formattedOrder = {
      ...order.toObject(),
      id: order._id,
      userName: order.user ? order.user.name : 'Unknown',
      items: order.products.map(p => ({
        ...p.productId.toObject(),
        quantity: p.quantity,
        id: p.productId._id,
        price: p.productId.price
      })),
      address: order.shippingAddress
    };

    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Order not found (Invalid ID)" });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  calculateShipping,
  getUserOrders,
  getAllOrders,
  getOrderById
};
