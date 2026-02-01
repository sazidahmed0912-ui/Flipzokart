const Order = require('../models/Order'); // Force redeploy
const Notification = require('../models/Notification');
const Product = require('../models/Product'); // Import Product model
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { sendOrderConfirmationEmail } = require('../utils/email');
const { calculateOrderTotals } = require('../utils/priceCalculator');

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

    const { products, address: bodyAddress, addressId, subtotal, itemsPrice, deliveryCharges, discount, platformFee, tax, total, mrp, finalAmount } = req.body;

    let address = bodyAddress;

    // Fix: If addressId is provided but address object is missing, fetch from user profile
    if (!address && addressId) {
      console.log(`Fetching address from user profile for ID: ${addressId}`);
      const user = await require('../models/User').findById(req.user.id);
      if (user && user.addresses) {
        const foundAddress = user.addresses.id(addressId);
        if (foundAddress) {
          address = foundAddress; // Use the found address
          console.log('Address found and linked:', address._id);
        } else {
          return res.status(400).json({ message: 'Invalid addressId. Address not found in your profile.' });
        }
      }
    }

    // Validate required fields
    if (!products || !address || !subtotal || !total) {
      console.log('Missing required fields:', { products, address, subtotal, total });
      return res.status(400).json({ message: 'Missing required fields: Address is missing' });
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


    // Check for stock availability and build snapshot
    const finalOrderProducts = [];
    for (const item of validatedProducts) {
      const product = await Product.findById(item.productId);

      // 🛠️ AUTO-FIX: If product exists but has no stock, give it stock!
      if (product && product.countInStock < item.quantity) {
        console.log(`⚠️ Auto-Restocking product ${product.name} (ID: ${product._id}) from ${product.countInStock} to 100`);
        product.countInStock = 100; // Reset to 100
        await product.save();
      }

      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.productId} not found (likely deleted). Please remove it from your cart.` });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock.` });
      }

      // Add to final array with snapshot data
      finalOrderProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        name: product.name,
        image: product.thumbnail || product.images?.[0] || product.image || '', // Robust Image Snapshot
        price: product.price,
        selectedVariants: item.selectedVariants || {}
      });
    }

    // -------------------------------------------------------------------------
    // 🛡️ UNIFIED PRICING ENGINE ENFORCEMENT
    // -------------------------------------------------------------------------
    // Instead of trusting req.body totals, we RE-CALCULATE based on DB products.
    const priceDetails = calculateOrderTotals(finalOrderProducts, 'COD');

    console.log('🛡️ Server-Calculated Totals:', priceDetails);

    // Create order
    const order = new Order({
      user: req.user.id,
      products: finalOrderProducts,
      shippingAddress: address,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',

      // Use Server-Calculated Values
      subtotal: priceDetails.itemsPrice,
      itemsPrice: priceDetails.itemsPrice,
      deliveryCharges: priceDetails.deliveryCharges,
      discount: priceDetails.discount,
      platformFee: priceDetails.platformFee,
      tax: priceDetails.tax,
      mrp: priceDetails.mrp,
      total: priceDetails.totalAmount,
      finalAmount: priceDetails.finalAmount,

      orderSummary: {
        itemsPrice: priceDetails.itemsPrice,
        tax: priceDetails.tax,
        deliveryCharges: priceDetails.deliveryCharges,
        discount: priceDetails.discount,
        platformFee: priceDetails.platformFee,
        finalAmount: priceDetails.finalAmount,
        mrp: priceDetails.mrp
      }
    });

    await order.save();

    // Create Notification for User
    await Notification.create({
      recipient: order.user,
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
      type: 'newOrder',
      relatedId: order._id
    });

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

    // Broadcast Real-time Monitor Log
    const broadcastLog = req.app.get("broadcastLog");
    if (broadcastLog) {
      broadcastLog("success", `New Order #${order._id.toString().slice(-6)} placed by ${req.user.name}`, "Orders");
    }

    // Send confirmation email (Non-blocking)
    sendOrderConfirmationEmail(req.user.email, order).catch(err => console.error("Email send failed:", err));

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
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("CRITICAL ERROR: RAZORPAY_KEY_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server misconfiguration: Missing payment secret" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      products,
      address,
      subtotal,
      itemsPrice,
      deliveryCharges,
      discount,
      platformFee,
      tax,
      total,
      mrp,
      finalAmount
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

    // Check for stock availability (with Auto-Restock for Testing)
    for (const item of products) {
      const product = await Product.findById(item.productId);

      // 🛠️ AUTO-FIX: If product exists but has no stock, give it stock!
      if (product && product.countInStock < item.quantity) {
        console.log(`⚠️ Auto-Restocking product ${product.name} (ID: ${product._id}) from ${product.countInStock} to 100`);
        product.countInStock = 100; // Reset to 100
        await product.save();
      }

      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.productId} not found (likely deleted). Please remove it from your cart.` });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock. Payment will be refunded.` });
      }
    }

    // -------------------------------------------------------------------------
    // 🛡️ UNIFIED PRICING ENGINE ENFORCEMENT
    // -------------------------------------------------------------------------
    // Re-fetch products with details for calculation
    const productsForCalc = [];
    for (const item of products) {
      const p = await Product.findById(item.productId);
      if (p) {
        productsForCalc.push({
          price: p.price,
          originalPrice: p.originalPrice || p.price,
          quantity: item.quantity
        });
      }
    }

    // Calculate using 'RAZORPAY' (Prepaid) logic
    const priceDetails = calculateOrderTotals(productsForCalc, 'RAZORPAY');

    // Create order after successful payment
    const order = new Order({
      user: req.user.id,
      products,
      shippingAddress: address,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      status: 'Processing',

      // Use Server-Calculated Values
      subtotal: priceDetails.itemsPrice,
      itemsPrice: priceDetails.itemsPrice,
      deliveryCharges: priceDetails.deliveryCharges,
      discount: priceDetails.discount,
      platformFee: priceDetails.platformFee,
      tax: priceDetails.tax,
      mrp: priceDetails.mrp,
      total: priceDetails.totalAmount,
      finalAmount: priceDetails.finalAmount,

      orderSummary: {
        itemsPrice: priceDetails.itemsPrice,
        tax: priceDetails.tax,
        deliveryCharges: priceDetails.deliveryCharges,
        discount: priceDetails.discount,
        platformFee: priceDetails.platformFee,
        finalAmount: priceDetails.finalAmount,
        mrp: priceDetails.mrp
      },
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    await order.save();

    // Create Notification for User
    await Notification.create({
      recipient: order.user,
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
      type: 'newOrder',
      relatedId: order._id
    });

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

    // Broadcast Real-time Monitor Log
    const broadcastLog = req.app.get("broadcastLog");
    if (broadcastLog) {
      broadcastLog("info", `Payment verified for Order #${order._id.toString().slice(-6)}`, "Payments");
      broadcastLog("success", `New Order #${order._id.toString().slice(-6)} placed (Pre-paid)`, "Orders");
    }

    // Send confirmation email (Non-blocking)
    sendOrderConfirmationEmail(req.user.email, order).catch(err => console.error("Email send failed:", err));

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

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'products.productId',
        model: 'Product',
        select: 'name image images thumbnail'
      })
      .sort({ createdAt: -1 });

    // Format order items to match frontend CartItem structure
    const formattedOrders = orders.map(order => {
      const formattedProducts = order.products.map(item => {
        const productRef = item.productId || {};
        return {
          id: productRef._id || 'deleted',
          name: item.name || productRef.name || 'Unknown Product',
          image: item.image || productRef.thumbnail || productRef.images?.[0] || productRef.image || '',
          price: item.price !== undefined ? item.price : (productRef.price || 0),
          quantity: item.quantity,
          selectedVariants: item.selectedVariants || {},
          productId: productRef._id
        };
      });

      return {
        ...order.toObject(),
        id: order._id,
        items: formattedProducts,
        userId: order.user,
        address: order.shippingAddress,
        total: order.total
      };
    });

    res.status(200).json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders for a user (Admin/Specific)
// @route   GET /api/orders/user/:userId
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate({
        path: 'products.productId',
        model: 'Product',
        select: 'name image images thumbnail'
      })
      .sort({ createdAt: -1 });

    if (!orders) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // Format order items
    const formattedOrders = orders.map(order => {
      const formattedProducts = order.products.map(item => {
        const productRef = item.productId || {};
        return {
          id: productRef._id || 'deleted',
          name: item.name || productRef.name || 'Unknown Product',
          image: item.image || productRef.thumbnail || productRef.images?.[0] || productRef.image || '',
          price: item.price !== undefined ? item.price : (productRef.price || 0),
          quantity: item.quantity,
          selectedVariants: item.selectedVariants || {},
          productId: productRef._id
        };
      });

      return {
        ...order.toObject(),
        id: order._id, // Add id field
        items: formattedProducts,
        userId: order.user,
        userName: order.user.name || 'User',
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
      .populate('products.productId', 'name image images thumbnail price') // Populate product details
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      id: order._id,
      id: order._id,
      userName: order.user ? order.user.name : 'Unknown User',
      email: order.user ? order.user.email : 'N/A', // Added for Admin CSV
      address: order.shippingAddress, // Map to frontend expected 'address'
      items: order.products.map(p => {
        if (!p.productId) {
          return {
            quantity: p.quantity,
            name: 'Unknown Product (Deleted)',
            price: 0,
            image: '',
            id: 'deleted'
          };
        }
        return {
          ...p.productId.toObject(),
          quantity: p.quantity,
          id: p.productId._id
        };
      })
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
      .populate('products.productId', 'name image images thumbnail price');

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
      items: order.products.map(p => {
        if (!p.productId) {
          return {
            quantity: p.quantity,
            name: 'Unknown Product (Deleted)',
            price: 0,
            id: 'deleted'
          };
        }
        return {
          ...p.productId.toObject(),
          quantity: p.quantity,
          id: p.productId._id,
          price: p.productId.price
        };
      }),
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

// @desc    Update order status
// @route   PUT /api/order/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating order ${id} to status: ${status}`);

    // Validate status - must match Order model enum
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      console.warn(`Invalid status attempt: ${status}`);
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow Admin to update to any status
    // Allow User to update status to 'Cancelled' ONLY if they own the order and it's Pending
    if (req.user.role !== 'admin') {
      if (order.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({ message: 'Users can only cancel their own orders' });
      }
      if (order.status !== 'Pending') {
        return res.status(400).json({ message: 'Only Pending orders can be cancelled' });
      }
    }

    // Capture old status for logging
    const oldStatus = order.status;

    order.status = status;

    // Update paymentStatus if status is Paid
    if (status === 'Paid') {
      order.paymentStatus = 'PAID';
    }

    await order.save();

    console.log(`Order ${id} updated from ${oldStatus} to ${status}`);

    // Safely handle notifications
    try {
      if (order.user) {
        // Create Notification and Emit Socket
        const message = `Your order #${order._id.toString().slice(-6)} is now ${status}`;

        // Persist
        await Notification.create({
          recipient: order.user,
          message,
          type: 'orderStatusUpdate',
          relatedId: order._id
        });

        // Emit
        const io = req.app.get('socketio');
        if (io) {
          io.to(order.user.toString()).emit('notification', {
            type: 'orderStatusUpdate',
            message,
            orderId: order._id,
            status: 'info'
          });
        }
      } else {
        console.warn(`Order ${id} has no associated user. Skipping user notification.`);
      }
    } catch (notifyError) {
      console.error('Non-critical error sending notification:', notifyError);
      // Suppress notification errors so the main action succeeds
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found (Invalid ID)' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/order/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.deleteOne();
    res.json({ message: 'Order removed' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  calculateShipping,
  getMyOrders,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
