import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';
import { AppError } from '../utils/AppError';
import { CartService } from '../services/cart.service';

const couponService = new CouponService();
const cartService = new CartService();

export class CouponController {

    // --- Admin Endpoints ---

    async createCoupon(req: Request, res: Response) {
        try {
            const coupon = await couponService.createCoupon(req.body);
            res.status(201).json({ success: true, data: coupon });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }

    async getAllCoupons(req: Request, res: Response) {
        try {
            const coupons = await couponService.getAllCoupons();
            res.status(200).json({ success: true, data: coupons });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateCouponStatus(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            if (!status) throw new AppError('Status is required', 400);

            const coupon = await couponService.updateCouponStatus(id, status);
            res.status(200).json({ success: true, data: coupon });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }

    async deleteCoupon(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await couponService.deleteCoupon(id);
            res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }

    async getCouponStats(req: Request, res: Response) {
        try {
            const stats = await couponService.getCouponStats();
            res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // --- User Endpoints ---

    async applyCoupon(req: Request, res: Response) {
        try {
            const { couponCode, paymentMethod } = req.body;
            const userId = (req as any).user?.id || req.body.userId;

            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }
            if (!couponCode) {
                throw new AppError('Coupon code is required', 400);
            }

            // Fetch user cart
            const cart = await cartService.getCart(userId);

            const result = await couponService.validateAndCalculateDiscount(userId, cart, couponCode, paymentMethod);

            res.status(200).json({ success: true, result });

        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
}
