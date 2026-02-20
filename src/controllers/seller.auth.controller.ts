import { Request, Response, NextFunction } from 'express';
import { SellerAuthService } from '../services/seller.auth.service';
import { catchAsync } from '../utils/catchAsync';

const sellerAuthService = new SellerAuthService();

export class SellerAuthController {
    /**
     * POST /api/seller/auth/send-otp
     * Body: { email }
     */
    sendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'Valid email is required' });
        }

        await sellerAuthService.sendSellerOtp(email);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your registered seller email',
        });
    });

    /**
     * POST /api/seller/auth/verify-otp
     * Body: { email, otp }
     */
    verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const { sellerToken, seller } = await sellerAuthService.verifySellerOtp(email, otp.toString());

        res.status(200).json({
            success: true,
            message: 'Seller login successful',
            // ✅ Returns seller_token — frontend stores as "seller_token" (never "token")
            seller_token: sellerToken,
            seller,
        });
    });
}
