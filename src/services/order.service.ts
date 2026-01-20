import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { CartService } from './cart.service';

const prisma = new PrismaClient();
const cartService = new CartService();

export class OrderService {
    async createOrder(userId: string, addressId: string) {
        const cart = await cartService.getCart(userId);

        if (cart.items.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address) throw new AppError('Address not found', 404);

        const totalAmount = cart.items.reduce((acc, item) => {
            return acc + Number(item.product.price) * item.quantity;
        }, 0);

        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount,
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
            include: { items: { include: { product: true } } },
        });
        if (!order) throw new AppError('Order not found', 404);
        return order;
    }

    async getUserOrders(userId: string) {
        return await prisma.order.findMany({
            where: { userId },
            include: { items: true },
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
