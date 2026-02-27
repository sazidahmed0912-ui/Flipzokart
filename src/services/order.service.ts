import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { CouponService } from './coupon.service';
import { PriceSummary } from '../utils/priceEngine';

const prisma = new PrismaClient();
const couponService = new CouponService();

export class OrderService {

    // ──────────────────────────────────────────────────────────────
    // 🔥 STEP 3 — ORDER CREATE (NO RECALCULATION)
    // Accepts frozen previewData verified by the controller's hash check.
    // ──────────────────────────────────────────────────────────────
    async createOrderFromPreview(
        userId: string,
        addressId: string,
        previewData: PriceSummary & { hash: string; couponCode?: string; paymentMethod?: string },
        paymentMethod?: string,
        couponCode?: string
    ) {
        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address) throw new AppError('Address not found', 404);

        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Generate dynamic IDs
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `FZK${timestamp}${random}`;
        const trackingId = `TRK${Math.floor(100000000 + Math.random() * 900000000)}`;

        const shippingSnapshot = {
            orderNumber,
            trackingId,
            shippingTo: {
                // @ts-ignore
                name: address.fullName || address.name || user?.name || 'Customer',
                // @ts-ignore
                phone: address.phone || user?.phone || 'N/A',
                // @ts-ignore
                email: address.email || user?.email || 'N/A',
                ...address
            },
            shippingFrom: {
                company: 'Fzokart Pvt. Ltd.',
                address: 'Morigaon, Assam, India',
                phone: '6033394539',
                email: 'fzokart@gmail.com',
                gstin: '18ABCDE1234F1Z5'
            }
        };

        // Resolve coupon for snapshot
        let couponSnapshot = null;
        const appliedCouponCode = couponCode || previewData.couponCode;

        if (appliedCouponCode && previewData.couponDiscount > 0) {
            // Build a minimal fake cart for coupon validation context
            // We only need the couponId from this — price is already frozen in preview
            try {
                const coupon = await prisma.coupon.findUnique({
                    where: { code: appliedCouponCode.toUpperCase() }
                });
                if (coupon) {
                    couponSnapshot = {
                        couponId: coupon.id,
                        code: coupon.code,
                        discountType: coupon.type,
                        discountAmount: previewData.couponDiscount,
                    };
                }
            } catch {
                // If coupon lookup fails, proceed without snapshot
            }
        }

        // ──────────────────────────────────────────────────────────────
        // CREATE ORDER — Use ONLY frozen values from previewData
        // NO new calculations here.
        // ──────────────────────────────────────────────────────────────
        const order = await prisma.order.create({
            data: {
                userId,
                // Legacy totalAmount for backward compat with old queries
                totalAmount: previewData.grandTotal,

                // @ts-ignore — orderNumber added in schema migration
                orderNumber,
                // @ts-ignore
                trackingId,
                shippingSnapshot,
                // @ts-ignore
                addressId: address.id,
                address: address as any,
                couponSnapshot: couponSnapshot as any,

                // 🔒 ULTRA LOCK — Frozen price fields (never recalculated)
                // @ts-ignore — these fields added via schema migration
                subtotal: previewData.subtotal,
                // @ts-ignore
                totalGST: previewData.totalGST,
                // @ts-ignore
                cgst: previewData.cgst,
                // @ts-ignore
                sgst: previewData.sgst,
                // @ts-ignore
                deliveryCharge: previewData.deliveryCharge,
                // @ts-ignore
                platformFee: previewData.platformFee,
                // @ts-ignore
                couponDiscount: previewData.couponDiscount,
                // @ts-ignore
                grandTotal: previewData.grandTotal,
                // @ts-ignore
                priceHash: previewData.hash,

                items: {
                    create: previewData.items.map((item) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        price: item.unitPrice,
                        productName: item.productName || 'Product',
                        image: item.image || '',
                        color: item.color || null,
                        size: item.size || null,
                        variantId: item.variantId || null,
                        // 🔒 ULTRA LOCK — Item-level frozen breakdown
                        // @ts-ignore
                        baseAmount: item.baseAmount,
                        // @ts-ignore
                        gstAmount: item.gstAmount,
                        // @ts-ignore
                        finalAmount: item.finalAmount,
                    })),
                },
            },
        });

        // Record coupon usage if applied
        if (couponSnapshot) {
            await (couponService as any).recordUsage(couponSnapshot.couponId, userId, order.id);
        }

        // Clear user's cart
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return order;
    }

    async getOrder(orderId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                items: { include: { product: true } }
            },
        });
        if (!order) throw new AppError('Order not found', 404);
        return order;
    }

    async getUserOrders(userId: string) {
        return await prisma.order.findMany({
            where: { userId },
            include: { items: true, user: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateOrderStatus(orderId: string, status: OrderStatus) {
        return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
        });
    }
}
