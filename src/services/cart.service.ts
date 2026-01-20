import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class CartService {
    async getCart(userId: string) {
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

    async addToCart(userId: string, productId: string, quantity: number) {
        let cart = await this.getCart(userId);

        const existingItem = cart.items.find((item) => item.productId === productId);

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
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

    async updateCartItem(userId: string, itemId: string, quantity: number) {
        const cart = await this.getCart(userId);
        const item = cart.items.find((i) => i.id === itemId);

        if (!item) throw new AppError('Item not found in cart', 404);

        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: itemId } });
        } else {
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });
        }

        return this.getCart(userId);
    }

    async removeFromCart(userId: string, itemId: string) {
        const cart = await this.getCart(userId);
        const item = cart.items.find((i) => i.id === itemId);

        if (!item) throw new AppError('Item not found in cart', 404);

        await prisma.cartItem.delete({ where: { id: itemId } });

        return this.getCart(userId);
    }
}
