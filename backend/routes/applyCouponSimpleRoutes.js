const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Simple, safe coupon application (STEP 2 & STEP 3 compatibility)
// Public endpoint: POST /api/apply-coupon (mounted on /api/apply-coupon)
router.post('/', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal == null) {
      return res.status(400).json({ success: false, message: 'Missing data' });
    }

    const cartTotalNum = Number(cartTotal);
    if (Number.isNaN(cartTotalNum)) {
      return res.status(400).json({ success: false, message: 'Invalid cartTotal' });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }

    if (coupon.expiry && coupon.expiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon expired' });
    }

    if (typeof coupon.minAmount === 'number' && cartTotalNum < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order ₹${coupon.minAmount} required`
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotalNum * coupon.value) / 100;
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'flat') {
      discount = coupon.value;
    }

    const finalAmount = Math.max(cartTotalNum - discount, 0);

    return res.json({ success: true, discount, finalAmount });
  } catch (error) {
    console.error('Simple Coupon Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
