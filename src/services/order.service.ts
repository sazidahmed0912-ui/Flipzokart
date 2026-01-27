import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { CartService } from './cart.service';

const prisma = new PrismaClient();
// Refreshed client
const cartService = new CartService();

export class OrderService {

    async createOrder(userId: string, addressId: string) {
        const cart = await cartService.getCart(userId);

        if (cart.items.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        if (!addressId) {
            throw new AppError('Address ID is mandatory', 400);
        }

        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address) throw new AppError('Address not found', 404);

        const totalAmount = cart.items.reduce((acc, item) => {
            return acc + Number(item.product.price) * item.quantity;
        }, 0);

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
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                },
            },
        });

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
