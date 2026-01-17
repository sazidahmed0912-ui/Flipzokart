const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');

const { 
  createOrder, 
  createRazorpayOrder, 
  verifyPayment,
  calculateShipping,
  getUserOrders // Import the new controller function
} = require('../controllers/orderController');

router.post('/create', protect, createOrder);
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/calculate-shipping', calculateShipping);
router.get('/user/:userId', protect, getUserOrders); // New route to get orders by user ID

module.exports = router;