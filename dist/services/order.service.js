"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const cart_service_1 = require("./cart.service");
const prisma = new client_1.PrismaClient();
const cartService = new cart_service_1.CartService();
class OrderService {
    async createOrder(userId, addressId) {
        const cart = await cartService.getCart(userId);
        if (cart.items.length === 0) {
            throw new AppError_1.AppError('Cart is empty', 400);
        }
        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address)
            throw new AppError_1.AppError('Address not found', 404);
        const totalAmount = cart.items.reduce((acc, item) => {
            return acc + Number(item.product.price) * item.quantity;
        }, 0);
        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount,
                address: address, // Storing address snapshot
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
    async getOrder(orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order)
            throw new AppError_1.AppError('Order not found', 404);
        return order;
    }
    async getUserOrders(userId) {
        return await prisma.order.findMany({
            where: { userId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateOrderStatus(orderId, status) {
        return await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
        });
    }
}
exports.OrderService = OrderService;
