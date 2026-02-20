import { Router } from 'express';
import { SellerAuthController } from '../controllers/seller.auth.controller';

const router = Router();
const sellerAuthController = new SellerAuthController();

// POST /api/seller/auth/send-otp   → send OTP to registered seller email
router.post('/send-otp', sellerAuthController.sendOtp);

// POST /api/seller/auth/verify-otp → verify OTP, return seller_token (JWT_SELLER_SECRET)
router.post('/verify-otp', sellerAuthController.verifyOtp);

export default router;
