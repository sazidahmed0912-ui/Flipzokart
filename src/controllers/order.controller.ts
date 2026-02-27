import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { priceEngine, generatePreviewHash, verifyPreviewHash, PriceSummary } from '../utils/priceEngine';
import { PrismaClient } from '@prisma/client';
import { CouponService } from '../services/coupon.service';

const prisma = new PrismaClient();
const orderService = new OrderService();
const couponService = new CouponService();

// ──────────────────────────────────────────────────────────────
// Delivery charge calculation
// ──────────────────────────────────────────────────────────────
function calculateDeliveryCharge(items: any[], paymentMethod?: string): number {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (subtotal >= 499) return 0; // Free delivery threshold
    return paymentMethod === 'COD' ? 50 : 0;
}

export class OrderController {

    // ──────────────────────────────────────────────────────────────
    // 🔥 STEP 2 — PREVIEW API (THE ONLY CALCULATION POINT)
    // POST /api/orders/preview  (also aliased: /api/order/preview)
    // ──────────────────────────────────────────────────────────────
    previewOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { cartItems, couponCode, paymentMethod } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return next(new AppError('Cart items are required', 400));
        }

        // 1. Fetch real product data from DB (prevent client-side price injection)
        const productIds = cartItems.map((i: any) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        if (products.length === 0) {
            return next(new AppError('No products found', 404));
        }

        // 2. Build engine input — merge DB prices with cart quantities
        const engineItems = cartItems.map((cartItem: any) => {
            const product = products.find(p => p.id === cartItem.productId);
            if (!product) return null;

            const sellingPrice = Number(product.discountPrice ?? product.price);

            return {
                _id: product.id,
                quantity: Number(cartItem.quantity) || 1,
                sellingPrice,
                gstRate: (product as any).gstRate ?? 0,
                priceType: (product as any).priceType ?? 'inclusive',
                productName: product.title,
                image: product.thumbnail ?? (product.images?.[0] || ''),
            };
        }).filter(Boolean);

        // 3. Delivery & platform fee
        const deliveryCharge = calculateDeliveryCharge(
            engineItems.map(i => ({ price: i!.sellingPrice, quantity: i!.quantity })),
            paymentMethod
        );
        const platformFee = 5;

        // 4. Coupon discount (server validates the coupon — never trust client value)
        let couponDiscount = 0;
        if (couponCode && (req as any).user) {
            try {
                // Build a minimal cart shape for coupon validation
                const fakeCart = {
                    items: engineItems.map(i => ({
                        productId: i!._id,
                        quantity: i!.quantity,
                        price: i!.sellingPrice,
                        product: { price: i!.sellingPrice, categoryId: '' }
                    }))
                };
                const couponResult = await couponService.validateAndCalculateDiscount(
                    (req as any).user.id, fakeCart, couponCode, paymentMethod
                ) as any;
                if (couponResult?.isValid) {
                    couponDiscount = couponResult.discountAmount;
                }
            } catch (err) {
                // Coupon invalid — just use 0 discount, don't block preview
                couponDiscount = 0;
            }
        }

        // 5. Run the SINGLE price engine
        const summary = priceEngine({
            items: engineItems as any,
            deliveryCharge,
            platformFee,
            couponDiscount,
        });

        // 6. Attach hash (tamper-proof fingerprint)
        const hash = generatePreviewHash(summary);

        // 7. Attach coupon code for reference (frontend may display it)
        const response = {
            ...summary,
            hash,
            couponCode: couponCode || null,
            paymentMethod: paymentMethod || null,
        };

        res.status(200).json(response);
    });

    // ──────────────────────────────────────────────────────────────
    // 🔐 STEP 3 — ORDER CREATE (NO RECALCULATION — hash-verified only)
    // POST /api/orders/checkout
    // ──────────────────────────────────────────────────────────────
    createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { previewData, addressId, paymentMethod, couponCode } = req.body;

        if (!addressId) {
            return next(new AppError('Delivery address is required', 400));
        }

        if (!previewData) {
            return next(new AppError('Preview data is required. Call /preview first.', 400));
        }

        // 🛡️ HASH VERIFICATION — Reject any tampered preview data
        if (!previewData.hash) {
            return next(new AppError('Price verification failed: hash missing', 400));
        }

        const isValid = verifyPreviewHash(previewData as PriceSummary & { hash: string });
        if (!isValid) {
            return next(new AppError('Price tampered — order rejected', 400));
        }

        const order = await orderService.createOrderFromPreview(
            (req as any).user.id,
            addressId,
            previewData,
            paymentMethod,
            couponCode
        );

        res.status(201).json({
            status: 'success',
            data: { order },
        });
    });

    getOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const order = await orderService.getOrder(req.params.id as string);
        res.status(200).json({
            status: 'success',
            data: { order },
        });
    });

    getUserOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const orders = await orderService.getUserOrders((req as any).user.id);
        res.status(200).json({
            status: 'success',
            data: { orders },
        });
    });

    updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id as string, status);
        res.status(200).json({
            status: 'success',
            data: { order },
        });
    });
}
