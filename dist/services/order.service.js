"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const cart_service_1 = require("./cart.service");
const prisma = new client_1.PrismaClient();
const cartService = new cart_service_1.CartService();
class OrderService {
    createOrder(userId, addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield cartService.getCart(userId);
            if (cart.items.length === 0) {
                throw new AppError_1.AppError('Cart is empty', 400);
            }
            const address = yield prisma.address.findUnique({ where: { id: addressId } });
            if (!address)
                throw new AppError_1.AppError('Address not found', 404);
            const totalAmount = cart.items.reduce((acc, item) => {
                return acc + Number(item.product.price) * item.quantity;
            }, 0);
            const order = yield prisma.order.create({
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
            yield prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            return order;
        });
    }
    getOrder(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield prisma.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { product: true } } },
            });
            if (!order)
                throw new AppError_1.AppError('Order not found', 404);
            return order;
        });
    }
    getUserOrders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.order.findMany({
                where: { userId },
                include: { items: true },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    updateOrderStatus(orderId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.order.update({
                where: { id: orderId },
                data: { orderStatus: status },
            });
        });
    }
}
exports.OrderService = OrderService;
