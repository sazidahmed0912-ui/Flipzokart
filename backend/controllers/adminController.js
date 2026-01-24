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
      const orders = await Order.find({ userId: user._id });
      const totalSpent = orders.reduce((acc, order) => acc + (order.paymentStatus === 'PAID' ? order.total : 0), 0);

      // Try to find a recent address from orders
      const lastOrder = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const address = lastOrder ? `${lastOrder.address.street}, ${lastOrder.address.city}, ${lastOrder.address.zipCode}` : 'N/A';

      return {
        ...user.toObject(),
        orders: orders.length,
        totalSpent,
        location: address !== 'N/A' ? lastOrder.address.city : 'Unknown', // Simple location for table
        fullAddress: address // Detailed address for 'View Address'
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

    // Create Notification
    const notification = await Notification.create({
      recipient: user._id,
      message,
      type: type || 'adminNotice',
      isRead: false
    });

    // Real-time Push
    const io = req.app.get('socketio');
    if (io) {
      io.to(user._id.toString()).emit('newNotification', notification);
      io.to(user._id.toString()).emit('notification', { message, type: type || 'info' }); // For Toast
      io.to(user._id.toString()).emit('adminNotice', { message, type: 'emergency' }); // Special event for emergency popup
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

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  sendUserNotice,
  updateUserRole,
  deleteUser
};
