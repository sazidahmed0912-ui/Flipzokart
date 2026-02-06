const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Total sales
    const totalSalesResult = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total products
    const totalProducts = await Product.countDocuments();

    // Total users
    const totalUsers = await User.countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('products.productId', 'name image');

    // Products by category
    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Sales over time (e.g., last 30 days)
    const salesOverTime = await Order.aggregate([
      { $match: { paymentStatus: 'PAID', createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          dailySales: { $sum: '$total' },
          dailyOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      productsByCategory,
      salesOverTime,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users with stats
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });

    // Enrich with order stats
    // Note: Doing this in loop for simplicity, but aggregation is better for scale. 
    // Given the scale mentioned (demo/small), this is fine.
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Fix: Order model uses 'user' field, not 'userId'
      const orders = await Order.find({ user: user._id });
      const totalSpent = orders.reduce((acc, order) => acc + (order.paymentStatus === 'PAID' ? order.total : 0), 0);

      // Try to find a recent address from orders
      const lastOrder = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      // Fix: Order schema has shippingAddress as Mixed (String or Object)
      let location = 'Unknown';
      let fullAddress = 'N/A';

      if (lastOrder && lastOrder.shippingAddress) {
        const addr = lastOrder.shippingAddress;

        if (typeof addr === 'string') {
          fullAddress = addr;
          // Try to extract City, State from string if it follows pattern roughly
          location = addr.split(',').slice(-2).join(', ');
          if (!location.trim()) location = addr; // Fallback to full string if split fails
        } else if (typeof addr === 'object') {
          // Construct string representation from Object
          const parts = [
            addr.address || addr.street,
            addr.city,
            addr.state,
            addr.zipCode || addr.pincode
          ].filter(Boolean);

          fullAddress = parts.join(', ');
          location = [addr.city, addr.state].filter(Boolean).join(', ') || 'Unknown';
        }
      }

      return {
        ...user.toObject(),
        orders: orders.length,
        totalSpent,
        location,
        fullAddress
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const Notification = require('../models/Notification'); // Import Notification

// @desc    Update user status (Suspend/Ban/Active)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  const { status, days, reason } = req.body; // days for suspension, reason for ban

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;

    if (status === 'Suspended') {
      const suspensionEnd = new Date();
      suspensionEnd.setDate(suspensionEnd.getDate() + (days || 1));
      user.suspensionEnd = suspensionEnd;
      user.banReason = reason || 'Temporary Suspension';
    } else if (status === 'Banned') {
      user.suspensionEnd = null; // Permanent
      user.banReason = reason || 'Violation of Terms';
    } else {
      // Reactivate
      user.suspensionEnd = null;
      user.banReason = null;
    }

    await user.save();

    // Notify User via Socket
    const io = req.app.get('socketio');
    if (io) {
      // Emit to specific user if possible, or broadcast update
      // For simplicity in this architecture, we emit a general list update or check if we can emit to user room
      io.emit('userStatusChanged', { userId: user._id, status, suspensionEnd: user.suspensionEnd });

      // Broadcast Real-time Monitor Log
      const broadcastLog = req.app.get("broadcastLog");
      if (broadcastLog) {
        broadcastLog("warning", `User ${user.email} status changed to ${status}`, "Admin");
      }
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send notice to user
// @route   POST /api/admin/users/:id/notice
// @access  Private/Admin
const sendUserNotice = async (req, res) => {
  const { message, type } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create Notification (Skip DB for 'warning' type)
    let notification;
    if (type !== 'warning') {
      notification = await Notification.create({
        recipient: user._id,
        message,
        type: type || 'adminNotice',
        isRead: false
      });
    } else {
      // Mock notification object for frontend
      notification = {
        _id: Date.now().toString(),
        recipient: user._id,
        message,
        type: 'warning',
        createdAt: new Date()
      };
    }

    // Real-time Push
    const io = req.app.get('socketio');
    if (io) {
      if (type !== 'warning') {
        io.to(user._id.toString()).emit('newNotification', notification);
      }

      // Emit 'notification' event which App.tsx listens to for Toasts
      // For warning, this ensures it pops up as a toast.
      io.to(user._id.toString()).emit('notification', {
        message,
        type: type || 'info'
      });

      if (type === 'emergency') {
        io.to(user._id.toString()).emit('adminNotice', { message, type: 'emergency' });
      }
    }

    // Broadcast Real-time Monitor Log
    const broadcastLog = req.app.get("broadcastLog");
    if (broadcastLog) {
      broadcastLog("info", `Notice sent to ${user.name}: "${message}"`, "System");
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error sending notice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new user (admin/seller/user)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password, // Will be hashed in pre-save middleware
      role: role || 'user',
      isVerified: true // Admin created users are verified
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Order Status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const historyEntry = {
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by Admin`
    };

    // Update fields
    order.status = status;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push(historyEntry);

    const updatedOrder = await order.save();

    // Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      // Emit to User Room
      // Protocol: ORDER_STATUS_UPDATED
      const payload = {
        orderId: order._id,
        status: status,
        location: order.currentLocation, // Send latest location too
        time: new Date(),
        message: `Your order #${order._id.toString().slice(-6)} is now ${status}`
      };

      io.to(order.user.toString()).emit('ORDER_STATUS_UPDATED', payload);

      // Admin Monitor
      io.to('admin-monitor').emit('ORDER_STATUS_UPDATED', { ...payload, updatedBy: 'Admin' });
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Order Location
// @route   PATCH /api/admin/orders/:id/location
// @access  Private/Admin
const updateOrderLocation = async (req, res) => {
  const { id } = req.params;
  const { lat, lng, address } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const locationData = {
      lat,
      lng,
      address,
      updatedAt: new Date()
    };

    order.currentLocation = locationData;
    const updatedOrder = await order.save();

    // Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      // Protocol: ORDER_LOCATION_UPDATED
      const payload = {
        orderId: order._id,
        status: order.status,
        location: locationData,
        time: new Date()
      };

      io.to(order.user.toString()).emit('ORDER_LOCATION_UPDATED', payload);
      io.to('admin-monitor').emit('ORDER_LOCATION_UPDATED', payload);
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  sendUserNotice,
  updateUserRole,
  deleteUser,
  createUser,
  updateOrderStatus,
  updateOrderLocation
};
