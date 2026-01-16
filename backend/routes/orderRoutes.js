const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');

const { 
  createOrder, 
  createRazorpayOrder, 
  verifyPayment,
  calculateShipping
} = require('../controllers/orderController');

router.post('/create', protect, createOrder);
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/calculate-shipping', calculateShipping);

module.exports = router;