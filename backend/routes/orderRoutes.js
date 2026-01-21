const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');

const {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  calculateShipping,
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
router.get('/user/:userId', protect, getUserOrders); // New route to get orders by user ID
router.get('/admin/all', protect, getAllOrders); // Admin route to get all orders
router.get('/:id', protect, getOrderById); // Get single order
router.put('/:id/status', protect, updateOrderStatus); // Update order status
router.delete('/:id', protect, deleteOrder); // Delete order

module.exports = router;