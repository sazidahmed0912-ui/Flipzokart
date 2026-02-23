import { PrismaClient, DiscountType, CouponStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class CouponService {

    // Admin CRUD
    async createCoupon(data: any) {
        // Validate required fields
        if (!data.code || !data.type || data.discountValue === undefined || !data.expiryDate) {
            throw new AppError('Code, type, discount value, and expiry date are required', 400);
        }

        // Check if exists
        const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
        if (existing) {
            throw new AppError('Coupon code already exists', 400);
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                type: data.type as DiscountType,
                discountValue: Number(data.discountValue),
                maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
                minCartValue: data.minCartValue ? Number(data.minCartValue) : 0,
                usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
                usageLimitPerUser: data.usageLimitPerUser ? Number(data.usageLimitPerUser) : 1,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                expiryDate: new Date(data.expiryDate),
                status: data.status || CouponStatus.ACTIVE,
                conditions: data.conditions ? data.conditions : null,
            }
        });

        return coupon;
    }

    async getAllCoupons() {
        return await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateCouponStatus(id: string, status: CouponStatus) {
        return await prisma.coupon.update({
            where: { id },
            data: { status }
        });
    }

    async deleteCoupon(id: string) {
        return await prisma.coupon.delete({ where: { id } });
    }

    async getCouponStats() {
        const total = await prisma.coupon.count();
        const active = await prisma.coupon.count({ where: { status: CouponStatus.ACTIVE } });
        const usageCountAgg = await prisma.coupon.aggregate({ _sum: { usageCount: true } });
        return {
            totalCoupons: total,
            activeCoupons: active,
            totalUsages: usageCountAgg._sum.usageCount || 0
        };
    }

    // End-User Validation & Logic
    async validateAndCalculateDiscount(userId: string, cart: any, couponCode: string, paymentMethod?: string) {
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
        if (!coupon) {
            throw new AppError('Invalid coupon code', 400);
        }

        if (coupon.status !== CouponStatus.ACTIVE) {
            throw new AppError('This coupon is currently inactive', 400);
        }

        const now = new Date();
        if (now < coupon.startDate) {
            throw new AppError('Coupon is not yet valid', 400);
        }
        if (now > coupon.expiryDate) {
            throw new AppError('Coupon has expired', 400);
        }

        // Usage limits
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new AppError('Coupon usage limit reached', 400);
        }

        const userUsages = await prisma.couponUsage.count({
            where: { couponId: coupon.id, userId }
        });

        if (coupon.usageLimitPerUser && userUsages >= coupon.usageLimitPerUser) {
            throw new AppError('You have already used this coupon maximum allowed times', 400);
        }

        // Calculate Cart Total (Gross)
        let cartTotal = 0;
        for (const item of cart.items) {
            const price = item.price || item.product.price;
            cartTotal += price * item.quantity;
        }

        // Condition Validation
        if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
            throw new AppError(\`Minimum cart value of ₹\${coupon.minCartValue} is required\`, 400);
        }

        const conditions = coupon.conditions as any || {};

        if (conditions.paymentRestriction && paymentMethod) {
            if (conditions.paymentRestriction.toLowerCase() !== paymentMethod.toLowerCase()) {
                throw new AppError(\`This coupon is only valid for \${conditions.paymentRestriction} payments\`, 400);
            }
        }

        if (conditions.firstOrderOnly) {
            const previousOrders = await prisma.order.count({ where: { userId } });
            if (previousOrders > 0) {
                throw new AppError('This coupon is only valid for your first order', 400);
            }
        }

        // Calculate Discount based on Engine Logic
        let discountAmount = 0;
        let finalCartTotal = cartTotal;
        let freeItems: any[] = [];
        let appliedProducts: string[] = [];

        switch (coupon.type) {
            case DiscountType.PERCENTAGE:
                discountAmount = cartTotal * (coupon.discountValue / 100);
                break;
            case DiscountType.FLAT:
                discountAmount = coupon.discountValue;
                break;
            case DiscountType.FREE_SHIPPING:
                // Assuming shipping is added later, we just mark discount as maybe shipping cost or tag it
                discountAmount = 0; // Return a specific flag below
                break;
            case DiscountType.CATEGORY_SPECIFIC: {
                if (!conditions.allowedCategories || !Array.isArray(conditions.allowedCategories)) {
                    throw new AppError('Invalid coupon setup for category specific discount', 500);
                }
                let applicableTotal = 0;
                for (const item of cart.items) {
                    if (conditions.allowedCategories.includes(item.product.categoryId)) {
                        applicableTotal += (item.price || item.product.price) * item.quantity;
                        appliedProducts.push(item.productId);
                    }
                }
                if (applicableTotal === 0) throw new AppError('No eligible products in cart for this coupon', 400);
                discountAmount = applicableTotal * (coupon.discountValue / 100);
                break;
            }
            case DiscountType.PRODUCT_SPECIFIC: {
                if (!conditions.allowedProducts || !Array.isArray(conditions.allowedProducts)) {
                    throw new AppError('Invalid coupon setup for product specific discount', 500);
                }
                let applicableTotal = 0;
                for (const item of cart.items) {
                    if (conditions.allowedProducts.includes(item.productId)) {
                        applicableTotal += (item.price || item.product.price) * item.quantity;
                        appliedProducts.push(item.productId);
                    }
                }
                if (applicableTotal === 0) throw new AppError('No eligible products in cart for this coupon', 400);
                discountAmount = applicableTotal * (coupon.discountValue / 100);
                break;
            }
            case DiscountType.BOGO: {
                // Buy 1 Get 1 Free. Find the cheapest eligible item and make it free
                let eligibleItems = [...cart.items];
                if (conditions.allowedCategories && Array.isArray(conditions.allowedCategories)) {
                    eligibleItems = eligibleItems.filter(item => conditions.allowedCategories.includes(item.product.categoryId));
                }
                
                let totalEligibleQuantity = eligibleItems.reduce((acc, item) => acc + item.quantity, 0);

                if (totalEligibleQuantity < 2) {
                    throw new AppError('You need at least 2 eligible items in cart for BOGO', 400);
                }

                // Sort by price ascending
                eligibleItems.sort((a, b) => (a.price || a.product.price) - (b.price || b.product.price));
                
                const freeItemCount = Math.floor(totalEligibleQuantity / 2);
                let currentFreeAllocated = 0;

                for (const item of eligibleItems) {
                    if (currentFreeAllocated >= freeItemCount) break;
                    
                    const price = item.price || item.product.price;
                    const canFree = Math.min(item.quantity, freeItemCount - currentFreeAllocated);
                    discountAmount += price * canFree;
                    currentFreeAllocated += canFree;
                    freeItems.push({ productId: item.productId, quantityFreed: canFree, priceFreed: price });
                }
                break;
            }
            case DiscountType.BUY_X_GET_Y: {
                const buyX = conditions.buyX || 1;
                let eligibleItemsForX = [...cart.items];
                let totalXQuantity = eligibleItemsForX.reduce((acc, item) => acc + item.quantity, 0);
                
                if (totalXQuantity < buyX) {
                    throw new AppError(\`You need to buy at least \${buyX} items to get the discount\`, 400);
                }
                discountAmount = coupon.discountValue; // Flat discount given when condition met
                break;
            }
            case DiscountType.MIN_CART_VALUE: {
                if (cartTotal >= coupon.minCartValue!) {
                    discountAmount = coupon.discountValue; // Assumes flat discount value if Min Cart met
                } else {
                    throw new AppError(\`Minimum cart value of ₹\${coupon.minCartValue} required\`, 400);
                }
                break;
            }
        }

        // Apply Excluded Categories/Products if they override
        if (conditions.excludedCategories && Array.isArray(conditions.excludedCategories)) {
             for (const item of cart.items) {
                 if (conditions.excludedCategories.includes(item.product.categoryId)) {
                     // In strict mode, we might reject the coupon completely, or just not discount this item.
                     // The logic above assumes we only sum applicable or total. Given complexity, if an excluded item is in cart,
                     // we should likely just warn, but if it was purely a global % discount, we'd subtract its contribution.
                     if (coupon.type === DiscountType.PERCENTAGE) {
                         discountAmount -= (item.price || item.product.price) * item.quantity * (coupon.discountValue / 100);
                     }
                 }
             }
        }

        // Enforce Max Discount Cap
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }

        // Prevent negative total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        finalCartTotal = cartTotal - discountAmount;

        return {
            isValid: true,
            couponCode: coupon.code,
            type: coupon.type,
            discountAmount: Math.floor(discountAmount), // Ensure integer or to fixed
            finalCartTotal: Math.floor(finalCartTotal),
            cartTotal: Math.floor(cartTotal),
            freeItems,
            appliedProducts,
            isFreeShipping: coupon.type === DiscountType.FREE_SHIPPING,
            couponId: coupon.id
        };
    }

    async recordUsage(couponId: string, userId: string, orderId: string) {
        await prisma.couponUsage.create({
            data: {
                couponId,
                userId,
                orderId
            }
        });

        await prisma.coupon.update({
            where: { id: couponId },
            data: { usageCount: { increment: 1 } }
        });
    }
}
