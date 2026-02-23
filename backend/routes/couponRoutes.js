const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public User Endpoint
router.post('/apply', protect, couponController.applyCoupon);

// Admin Endpoints
router.use(protect, admin);
router.post('/', couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.get('/stats', couponController.getCouponStats);
router.patch('/:id/status', couponController.updateCouponStatus);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
