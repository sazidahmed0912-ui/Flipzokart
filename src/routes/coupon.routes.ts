import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const couponController = new CouponController();

// --- Public / User Routes ---
// The user endpoint for applying a coupon in cart
router.post('/apply', protect, couponController.applyCoupon.bind(couponController));

// --- Admin Routes ---
router.use(protect, restrictTo('ADMIN'));

router.post('/', couponController.createCoupon.bind(couponController));
router.get('/', couponController.getAllCoupons.bind(couponController));
router.get('/stats', couponController.getCouponStats.bind(couponController));
router.patch('/:id/status', couponController.updateCouponStatus.bind(couponController));
router.delete('/:id', couponController.deleteCoupon.bind(couponController));

export default router;
