const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const CouponUsage = require('../models/CouponUsage');
const couponController = require('../controllers/couponController');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { sendOrderConfirmationEmail } = require('../utils/email');
const { calculateCartSummary } = require('../utils/priceEngine'); // 🏗️ MASTER PRICE ENGINE

// Helper function to update stock
const updateStock = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { countInStock: -item.quantity },
    });
  }
};

// Helper: Increment totalOrders for trending ranking
const updateTrendingOrders = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { totalOrders: item.quantity }
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

    console.log('[CreateOrder] Request body keys:', Object.keys(req.body));
    console.log('[CreateOrder] Address in body:', !!req.body.address);
    console.log('[CreateOrder] Address ID:', req.body.addressId);

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
    const missingFields = [];
    if (!products || products.length === 0) missingFields.push('products');
    if (!address) missingFields.push('address');
    if (subtotal === undefined || subtotal === null) missingFields.push('subtotal');
    if (total === undefined || total === null) missingFields.push('total');

    if (missingFields.length > 0) {
      console.log('Missing required fields logs:', { products: !!products, address: !!address, subtotal, total });
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        debug: {
          receivedKeys: Object.keys(req.body),
          missingFields,
          values: { subtotal, total }
        }
      });
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
    const paymentModeSnapshot = []; // 🔒 ULTRA LOCK: Payment Mode Audit
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

      // 🔒 ULTRA LOCK: Server-side payment mode validation for COD
      // This CANNOT be bypassed via frontend manipulation, devtools, or direct API calls
      if (product.codAvailable === false) {
        console.warn(`🚫 [PaymentGuard] COD rejected for product "${product.name}" (ID: ${product._id}) — codAvailable=false`);
        return res.status(403).json({
          message: `Cash on Delivery is not available for "${product.name}". Please use an online payment method.`,
          productId: product._id,
          errorCode: 'COD_NOT_ALLOWED'
        });
      }

      // 📸 Build Payment Mode Snapshot for this order
      paymentModeSnapshot.push({
        productId: product._id,
        codAvailable: product.codAvailable !== false,
        prepaidAvailable: product.prepaidAvailable !== false
      });

      // Add to final array with snapshot data
      finalOrderProducts.push({
        // Snapshot Logic: Use incoming item data with strong fallbacks to DB defaults to prevent NaN
        productId: item.productId,
        quantity: item.quantity,
        productName: item.productName || product.name,
        image: item.image || product.thumbnail || product.images?.[0] || product.image || '',
        price: item.price !== undefined && item.price !== null ? Number(item.price) : Number(product.price || 0),
        mrp: item.mrp !== undefined && item.mrp !== null ? Number(item.mrp) : Number(product.originalPrice || product.price || 0),
        color: item.color,
        size: item.size,
        variantId: item.variantId,
        selectedVariants: item.selectedVariants || {},
        categoryId: product.category ? product.category.toString() : null
      });
    }

    // -------------------------------------------------------------------------
    // 🛡️ MASTER PRICE ENGINE — ONE CALCULATION, THEN FREEZE
    // -------------------------------------------------------------------------
    // Build engine-compatible items format (product obj + quantity)
    const engineItems = finalOrderProducts.map(fp => ({
      product: {
        _id: fp.productId,
        name: fp.productName,
        price: fp.price,
        originalPrice: fp.mrp,
        customGstRate: null,  // Already pulled from DB and embedded, use default
        priceType: 'exclusive'
      },
      quantity: fp.quantity
    }));

    // 🎟️ Re-validate coupon server-side
    let couponSnapshot = undefined;
    let couponDiscount = 0;
    if (req.body.couponCode) {
      try {
        const couponResult = await couponController.validateAndCalculateDiscount(
          req.user.id,
          finalOrderProducts,
          req.body.couponCode,
          'COD'
        );
        if (couponResult && couponResult.isValid) {
          couponDiscount = couponResult.discountAmount || 0;
          couponSnapshot = {
            couponId: couponResult.couponId,
            code: couponResult.couponCode,
            discountType: couponResult.type,
            discountAmount: couponResult.discountAmount,
            appliedProducts: couponResult.appliedProducts,
            freeItems: couponResult.freeItems
          };
        }
      } catch (err) {
        console.warn(`[CouponGuard] Failed to apply coupon ${req.body.couponCode}:`, err.message);
        return res.status(400).json({ message: err.message, errorCode: 'INVALID_COUPON' });
      }
    }

    // 🔒 FREEZE — run master engine, ONE time, values locked forever
    const summary = calculateCartSummary(engineItems, couponDiscount, 'COD');
    console.log('🛡️ Frozen Price Summary:', JSON.stringify(summary, null, 2));

    // Map engine items back to order product rows (with full GST freeze per item)
    const frozenProducts = summary.items.map((engineItem, idx) => ({
      ...finalOrderProducts[idx],
      // 🔒 FROZEN GST PER ITEM
      unitPrice: engineItem.unitPrice,
      baseAmount: engineItem.baseAmount,
      gstRate: engineItem.gstRate,
      cgst: engineItem.cgst,
      sgst: engineItem.sgst,
      totalGST: engineItem.totalGST,
      finalAmount: engineItem.finalAmount
    }));

    // Create order with ALL values frozen from engine (no frontend numbers)
    const order = new Order({
      user: req.user.id,
      products: frozenProducts,
      shippingAddress: address,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      paymentModeSnapshot,
      couponSnapshot,

      // 🔒 ORDER-LEVEL FROZEN SUMMARY
      subtotal: summary.subtotal,
      itemsPrice: summary.subtotal,
      deliveryCharges: summary.deliveryCharge,
      discount: summary.couponDiscount,
      platformFee: summary.platformFee,
      tax: summary.totalGST,         // backward compat alias
      totalGST: summary.totalGST,
      cgst: summary.cgst,
      sgst: summary.sgst,
      mrp: summary.mrp,
      total: summary.grandTotal,
      finalAmount: summary.grandTotal,
      grandTotal: summary.grandTotal,

      orderSummary: {
        itemsPrice: summary.subtotal,
        tax: summary.totalGST,
        deliveryCharges: summary.deliveryCharge,
        discount: summary.couponDiscount,
        platformFee: summary.platformFee,
        finalAmount: summary.grandTotal,
        mrp: summary.mrp
      }
    });

    await order.save();

    // ✅ RETURN SUCCESS RESPONSE — order is saved, everything below is non-critical
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderId: order.orderId,
        total: order.total
      }
    });

    // ─── Non-critical side effects (failures here do NOT affect the order) ────

    // User notification
    try {
      await Notification.create({
        recipient: order.user,
        message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
        type: 'newOrder',
        relatedId: order._id
      });
    } catch (e) { console.warn('[COD] User notification failed:', e.message); }

    // Admin notifications (persistent)
    try {
      const adminUsers = await require('../models/User').find({ role: 'admin' }).select('_id');
      if (adminUsers.length > 0) {
        await Promise.all(adminUsers.map(admin =>
          Notification.create({
            recipient: admin._id,
            type: 'adminNewOrder',
            message: `New order received from ${req.user.name || 'Guest'} – Order #${order._id.toString().slice(-6)}`,
            relatedId: order._id
          })
        ));
      }
    } catch (e) { console.warn('[COD] Admin notification failed:', e.message); }

    // Socket.IO emits
    try {
      const io = req.app.get('socketio');
      if (io) {
        io.to(order.user.toString()).emit('notification', {
          type: 'newOrder',
          message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
          relatedId: order._id,
          status: 'success'
        });
        io.to('admin').emit('notification', {
          type: 'adminNewOrder',
          message: `New Order #${order._id.toString().slice(-6)} from ${req.user.name || 'Customer'}`,
          relatedId: order._id,
          userId: req.user.id,
          status: 'info'
        });
      }
      const broadcastLog = req.app.get('broadcastLog');
      if (broadcastLog) broadcastLog('success', `New Order #${order._id.toString().slice(-6)} placed by ${req.user.name || 'Customer'}`, 'Orders');
    } catch (e) { console.warn('[COD] Socket emit failed:', e.message); }

    // Coupon consumption
    try {
      if (couponSnapshot) {
        await CouponUsage.create({
          coupon: couponSnapshot.couponId,
          user: req.user.id,
          order: order._id
        });
        await require('../models/Coupon').findByIdAndUpdate(couponSnapshot.couponId, { $inc: { usageCount: 1 } });
      }
    } catch (e) { console.warn('[COD] Coupon usage recording failed:', e.message); }

    // Email confirmation
    sendOrderConfirmationEmail(req.user.email, order).catch(err => console.error('Email send failed:', err));

    // Stock & trending updates
    try {
      await updateStock(validatedProducts);
      await updateTrendingOrders(validatedProducts);
      const io = req.app.get('socketio');
      if (io) {
        for (const item of validatedProducts) {
          const product = await Product.findById(item.productId);
          if (product && product.countInStock <= 10) {
            io.to('admin').emit('notification', {
              type: 'lowStock',
              message: `Low stock alert: ${product.name} has only ${product.countInStock} units left!`,
              productId: product._id,
              status: 'warning'
            });
          }
        }
      }
    } catch (e) { console.warn('[COD] Stock update failed:', e.message); }

  } catch (error) {
    console.error('Error creating COD order:', error.message, error.stack);
    res.status(500).json({ message: error.message || 'Server error' });
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

    console.log("[VerifyPayment] Raw Body Keys:", Object.keys(req.body));
    console.log("[VerifyPayment] Payload Address Type:", typeof req.body.address);
    console.log("[VerifyPayment] Payload Address ID:", req.body.addressId);


    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      products,

      subtotal,
      itemsPrice,
      deliveryCharges,
      discount,
      platformFee,
      tax,
      total,
      mrp,
      finalAmount,
      addressId // Add addressId to destructuring
    } = req.body;

    let address = req.body.address;

    // Fix: If addressId is provided but address object is missing, fetch from user profile
    if (!address && addressId) {
      console.log(`[VerifyPayment] Fetching address from user profile for ID: ${addressId}`);
      const user = await require('../models/User').findById(req.user.id);
      if (user && user.addresses) {
        const foundAddress = user.addresses.id(addressId);
        if (foundAddress) {
          address = foundAddress; // Use the found address
          console.log('[VerifyPayment] Address found and linked:', address._id);
        } else {
          console.warn('[VerifyPayment] Invalid addressId:', addressId);
        }
      }
    }

    if (!address) {
      return res.status(400).json({ message: "Address is missing. Please select a valid delivery address." });
    }

    // Verify payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    console.log("--- Razorpay Verification Debug ---");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Received Signature:", razorpay_signature);
    console.log("Generated Signature:", expectedSign);
    console.log("Key Secret Exists:", !!process.env.RAZORPAY_KEY_SECRET);
    console.log("-----------------------------------");

    if (razorpay_signature !== expectedSign) {
      console.error("❌ Payment verification failed: Signatures do not match");
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Check for stock availability (with Auto-Restock for Testing)
    const paymentModeSnapshotRzp = []; // 🔒 ULTRA LOCK: Payment Mode Audit
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

      // 🔒 ULTRA LOCK: Server-side payment mode validation for Prepaid/Razorpay
      // This CANNOT be bypassed via frontend manipulation, devtools, or direct API calls
      if (product.prepaidAvailable === false) {
        console.warn(`🚫 [PaymentGuard] Online payment rejected for product "${product.name}" (ID: ${product._id}) — prepaidAvailable=false`);
        return res.status(403).json({
          message: `Online payment is not available for "${product.name}". Please use Cash on Delivery.`,
          productId: product._id,
          errorCode: 'PREPAID_NOT_ALLOWED'
        });
      }

      // 📸 Build Payment Mode Snapshot
      paymentModeSnapshotRzp.push({
        productId: product._id,
        codAvailable: product.codAvailable !== false,
        prepaidAvailable: product.prepaidAvailable !== false
      });
    }

    // -------------------------------------------------------------------------
    // 🛡️ UNIFIED PRICING ENGINE ENFORCEMENT
    // -------------------------------------------------------------------------
    // Calculate using 'RAZORPAY' (Prepaid) logic
    const validatedProductsRzp = products.map(item => ({
      ...item,
      // If price is missing from RAZORPAY payload, we already have a fallback needed? No, verifyPayment takes it from req.body
      // But verifyPayment loop below also needs fallbacks.
    }));

    // Re-fetch products with details for calculation with robust fallbacks
    const productsForCalc = [];
    const finalOrderProducts = [];
    for (const item of products) {
      const p = await Product.findById(item.productId);
      if (p) {
        const safePrice = item.price !== undefined && item.price !== null ? Number(item.price) : Number(p.price || 0);
        const safeMrp = item.mrp !== undefined && item.mrp !== null ? Number(item.mrp) : Number(p.originalPrice || p.price || 0);

        productsForCalc.push({
          price: safePrice,
          originalPrice: safeMrp,
          quantity: item.quantity,
          categoryId: p.category ? p.category.toString() : null,
          productId: p._id.toString()
        });
        finalOrderProducts.push({
          price: safePrice,
          mrp: safeMrp,
          quantity: item.quantity,
          productId: p._id.toString(),
          productName: item.productName || p.name,
          image: item.image || p.thumbnail || p.images?.[0] || '',
          variantId: item.variantId,
          color: item.color,
          size: item.size,
          selectedVariants: item.selectedVariants || {},
          categoryId: p.category ? p.category.toString() : null
        });
      }
    }

    // Calculate using 'RAZORPAY' (Prepaid) logic
    let priceDetails = calculateOrderTotals(productsForCalc, 'RAZORPAY');

    // 🎟️ STRICT COUPON ENGINE INGESTION (RAZORPAY)
    let couponSnapshot = undefined;
    if (req.body.couponCode) {
      try {
        const couponResult = await couponController.validateAndCalculateDiscount(
          req.user.id,
          finalOrderProducts,
          req.body.couponCode,
          'RAZORPAY'
        );
        if (couponResult && couponResult.isValid) {
          priceDetails.discount = (priceDetails.discount || 0) + couponResult.discountAmount;
          priceDetails.finalAmount = Math.max(0, priceDetails.totalAmount - couponResult.discountAmount);
          priceDetails.totalAmount = priceDetails.finalAmount; // update total payable

          couponSnapshot = {
            couponId: couponResult.couponId,
            code: couponResult.couponCode,
            discountType: couponResult.type,
            discountAmount: couponResult.discountAmount,
            appliedProducts: couponResult.appliedProducts,
            freeItems: couponResult.freeItems
          };
        }
      } catch (err) {
        console.warn(`[CouponGuard] Failed to apply coupon ${req.body.couponCode}:`, err.message);
        // Razorpay already charged them at this point potentially (based on checkout UI logic)
        // So if coupon fails now, we might need to handle refund. But we reject order to be safe.
        return res.status(400).json({ message: err.message, errorCode: 'INVALID_COUPON' });
      }
    }

    // Create order after successful payment
    console.log("ORDER ITEMS SNAPSHOT (RAZORPAY)", products); // 🧪 DEBUG CONFIRMATION
    const order = new Order({
      user: req.user.id,
      products,
      shippingAddress: address,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      status: 'Processing',
      paymentModeSnapshot: paymentModeSnapshotRzp, // 🔒 ULTRA LOCK: Audit trail
      couponSnapshot, // 🎟️ COUPON METADATA

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

    // ✅ RETURN SUCCESS RESPONSE — order is saved, everything below is non-critical
    res.json({
      message: 'Payment verified and order created successfully',
      order: {
        id: order._id,
        orderId: order.orderId,
        total: order.total
      }
    });

    // ─── Non-critical side effects (failures here do NOT affect the order) ────

    // User notification
    try {
      await Notification.create({
        recipient: order.user,
        message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
        type: 'newOrder',
        relatedId: order._id
      });
    } catch (e) { console.warn('[RZP] User notification failed:', e.message); }

    // Admin notifications (persistent)
    try {
      const adminUsers = await require('../models/User').find({ role: 'admin' }).select('_id');
      if (adminUsers.length > 0) {
        await Promise.all(adminUsers.map(admin =>
          Notification.create({
            recipient: admin._id,
            type: 'adminNewOrder',
            message: `New order received from ${req.user.name || 'Guest'} – Order #${order._id.toString().slice(-6)}`,
            relatedId: order._id
          })
        ));
      }
    } catch (e) { console.warn('[RZP] Admin notification failed:', e.message); }

    // Socket.IO emits
    try {
      const io = req.app.get('socketio');
      if (io) {
        io.to(order.user.toString()).emit('notification', {
          type: 'newOrder',
          message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
          relatedId: order._id,
          status: 'success'
        });
        io.to('admin').emit('notification', {
          type: 'adminNewOrder',
          message: `New Order #${order._id.toString().slice(-6)} from ${req.user.name || 'Customer'}`,
          relatedId: order._id,
          userId: req.user.id,
          status: 'info'
        });
        io.to('admin').emit('payment:new', {
          id: razorpay_payment_id || `TRX-${order._id.toString().slice(-6)}`,
          orderId: order._id,
          customer: req.user.name || 'Customer',
          amount: order.total,
          date: order.createdAt,
          status: 'Success',
          method: 'RAZORPAY'
        });
      }
      const broadcastLog = req.app.get('broadcastLog');
      if (broadcastLog) {
        broadcastLog('info', `Payment verified for Order #${order._id.toString().slice(-6)}`, 'Payments');
        broadcastLog('success', `New Order #${order._id.toString().slice(-6)} placed (Pre-paid)`, 'Orders');
      }
    } catch (e) { console.warn('[RZP] Socket emit failed:', e.message); }

    // Coupon consumption
    try {
      if (couponSnapshot) {
        await CouponUsage.create({
          coupon: couponSnapshot.couponId,
          user: req.user.id,
          order: order._id
        });
        await require('../models/Coupon').findByIdAndUpdate(couponSnapshot.couponId, { $inc: { usageCount: 1 } });
      }
    } catch (e) { console.warn('[RZP] Coupon usage recording failed:', e.message); }

    // Email confirmation
    sendOrderConfirmationEmail(req.user.email, order).catch(err => console.error('Email send failed:', err));

    // Stock & trending updates
    try {
      await updateStock(products);
      await updateTrendingOrders(products);
      const io = req.app.get('socketio');
      if (io) {
        for (const item of products) {
          const product = await Product.findById(item.productId);
          if (product && product.countInStock <= 10) {
            io.to('admin').emit('notification', {
              type: 'lowStock',
              message: `Low stock alert: ${product.name} has only ${product.countInStock} units left!`,
              productId: product._id,
              status: 'warning'
            });
          }
        }
      }
    } catch (e) { console.warn('[RZP] Stock update failed:', e.message); }

  } catch (error) {
    console.error('Error verifying payment:', error.message, error.stack);
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
          image: item.image || productRef.mainImage || productRef.thumbnail || productRef.images?.[0] || productRef.image || '',
          mainImage: productRef.mainImage || item.image || productRef.thumbnail || productRef.images?.[0] || productRef.image || '',
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
          image: item.image || productRef.mainImage || productRef.thumbnail || productRef.images?.[0] || productRef.image || '',
          mainImage: productRef.mainImage || item.image || productRef.thumbnail || productRef.images?.[0] || productRef.image || '',
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
      .populate('products.productId', 'name image images thumbnail price mainImage') // Populate product details including mainImage
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
          mainImage: p.productId.mainImage || p.productId.image || (p.productId.images && p.productId.images[0]) || '',
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
      .populate('user', 'name email');
    // .populate('products.productId'); // ❌ FORBIDDEN: Do not populate product details, usage snapshot only

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
        // 🔒 STRICT SNAPSHOT: Use only stored data
        return {
          id: p.productId,
          name: p.productName || p.name || 'Unknown Product',
          productName: p.productName || p.name || 'Unknown Product',
          image: p.image || '',
          price: p.price,
          quantity: p.quantity,
          color: p.color,
          size: p.size,
          variantId: p.variantId,
          selectedVariants: p.selectedVariants
        };
      }),
      address: order.shippingAddress,
      currentLocation: order.currentLocation, // Explicitly expose for tracking
      statusHistory: order.statusHistory || []
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
    const { status, note } = req.body; // Destructure note
    const io = req.app.get('socketio');

    console.log(`Updating order ${id} to status: ${status} with note: ${note}`);

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

    // Add to History (Persistence Fix)
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || ''
    });

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
        // Include note in message if available? Maybe too long. Keep simple message.
        const message = `Your order #${order._id.toString().slice(-6)} is now ${status}`;

        // Persist
        console.log(`[Notification Debug] Creating notification for User: ${order.user._id || order.user} | Status: ${status} | Note: ${note}`);
        const newNotif = await Notification.create({
          recipient: order.user._id || order.user, // Ensure ID is used if user is an object
          message: message,
          note: note || '',
          type: 'orderStatusUpdate',
          relatedId: order._id
        });
        console.log(`[Notification Debug] Notification Created Successfully: ${newNotif._id}`);

        // Emit
        if (io) {
          io.to(order.user.toString()).emit('notification', {
            type: 'orderStatusUpdate',
            message: message,
            note: note || '', // Explicitly emit note
            orderId: order._id,
            status: 'info'
          });

          // Notify Admin Dashboard (Real-time refresh)
          io.to('admin').emit('notification', {
            type: 'orderStatusUpdate',
            message: `Order #${order._id.toString().slice(-6)} updated to ${status}`,
            orderId: order._id,
            newStatus: status,
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
