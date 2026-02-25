const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const { getCart, updateCart, mergeCart, cartSummary } = require('../controllers/cartController');

router.route('/')
    .get(protect, getCart)
    .put(protect, updateCart);

router.post('/merge', protect, mergeCart);

// 🏇 Server-authoritative price summary (GST + shipping + coupon)
router.post('/summary', protect, cartSummary);

module.exports = router;
