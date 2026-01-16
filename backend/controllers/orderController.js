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


    // Check for stock availability
    for (const item of validatedProducts) {
      const product = await Product.findById(item.productId);
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

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  calculateShipping
};
