import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { CartService } from './cart.service';
import { CouponService } from './coupon.service';

const prisma = new PrismaClient();
// Refreshed client
const cartService = new CartService();
const couponService = new CouponService();

export class OrderService {

    async createOrder(userId: string, addressId: string, couponCode?: string, paymentMethod?: string) {
        const cart = await cartService.getCart(userId);

        if (cart.items.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        if (!addressId) {
            throw new AppError('Address ID is mandatory', 400);
        }

        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address) throw new AppError('Address not found', 404);

        let validatedCouponContext: any = null;

        if (couponCode) {
            // Strictly re-validate the coupon just before creating the order
            validatedCouponContext = await couponService.validateAndCalculateDiscount(userId, cart, couponCode, paymentMethod);
        }

        // Standard gross calculation
        let totalAmount = cart.items.reduce((acc, item) => {
            const price = item.price || Number(item.product.price);
            return acc + price * item.quantity;
        }, 0);

        let couponSnapshot = null;

        if (validatedCouponContext && validatedCouponContext.isValid) {
            totalAmount = validatedCouponContext.finalCartTotal;
            couponSnapshot = {
                couponId: validatedCouponContext.couponId,
                code: validatedCouponContext.couponCode,
                type: validatedCouponContext.type,
                discountAmount: validatedCouponContext.discountAmount,
                appliedProducts: validatedCouponContext.appliedProducts,
                freeItems: validatedCouponContext.freeItems
            };
        }

        // Generate dynamic IDs
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `FZK${timestamp}${random}`;
        const trackingId = `TRK${Math.floor(100000000 + Math.random() * 900000000)}`;

        const user = await prisma.user.findUnique({ where: { id: userId } });

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
                gstin: '18ABCDE1234F1Z5' // Dynamic or env var in real app
            }
        };


        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount,
                // @ts-ignore
                orderNumber,
                // @ts-ignore
                trackingId,
                shippingSnapshot,
                // @ts-ignore
                addressId: address.id, // Canonical reference
                address: address as any, // Storing address snapshot
                couponSnapshot: couponSnapshot as any,
                items: {
                    create: cart.items.map((item) => {
                        let finalItemPrice = item.price || item.product.price;
                        // Handle BOGO zero cost adjustments securely
                        if (validatedCouponContext && validatedCouponContext.freeItems) {
                            const freeItemInfo = validatedCouponContext.freeItems.find((f: any) => f.productId === item.productId);
                            if (freeItemInfo && freeItemInfo.quantityFreed >= item.quantity) {
                                finalItemPrice = 0; // The entire quantity is free
                            }
                        }

                        const orderItemData = {
                            product: { connect: { id: item.productId } },
                            quantity: item.quantity,
                            price: finalItemPrice, // Use snapshot price or 0 if BOGO free
                            // Critical Snapshot Data
                            productName: item.product.title,
                            image: item.image || item.product.thumbnail || item.product.images[0] || '',
                            color: item.color,
                            size: item.size,
                            variantId: item.variantId
                        };
                        console.log("ORDER ITEM SNAPSHOT:", orderItemData);
                        return orderItemData;
                    }),
                },
            },
        });

        if (couponSnapshot) {
            await couponService.recordUsage(couponSnapshot.couponId, userId, order.id);
        }

        // Clear cart
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

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
