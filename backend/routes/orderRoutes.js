const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');

const {
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
} = require('../controllers/orderController');

router.post('/create', protect, createOrder);
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/calculate-shipping', calculateShipping);
router.get('/my-orders', protect, getMyOrders); // Get logged in user orders
router.get('/user/:userId', protect, getUserOrders); // Get orders by user ID (Admin)
router.get('/admin/all', protect, getAllOrders); // Admin route to get all orders
router.get('/:id', protect, getOrderById); // Get single order
router.put('/:id/status', protect, updateOrderStatus); // Update order status
router.delete('/:id', protect, deleteOrder); // Delete order

module.exports = router;