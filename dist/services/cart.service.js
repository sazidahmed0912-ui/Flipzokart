"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class CartService {
    async getCart(userId) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } },
            });
        }
        return cart;
    }
    async addToCart(userId, productId, quantity) {
        let cart = await this.getCart(userId);
        const existingItem = cart.items.find((item) => item.productId === productId);
        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }
        else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }
        return this.getCart(userId);
    }
    async updateCartItem(userId, itemId, quantity) {
        const cart = await this.getCart(userId);
        const item = cart.items.find((i) => i.id === itemId);
        if (!item)
            throw new AppError_1.AppError('Item not found in cart', 404);
        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: itemId } });
        }
        else {
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });
        }
        return this.getCart(userId);
    }
    async removeFromCart(userId, itemId) {
        const cart = await this.getCart(userId);
        const item = cart.items.find((i) => i.id === itemId);
        if (!item)
            throw new AppError_1.AppError('Item not found in cart', 404);
        await prisma.cartItem.delete({ where: { id: itemId } });
        return this.getCart(userId);
    }
}
exports.CartService = CartService;
