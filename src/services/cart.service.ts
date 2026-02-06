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

    async addToCart(userId: string, productId: string, quantity: number, variant?: { variantId?: string, color?: string, size?: string, image?: string, price?: number }) {
        let cart = await this.getCart(userId);

        // Check if item exists (Same Product AND Same Variant)
        const existingItem = cart.items.find((item) => {
            const sameProduct = item.productId === productId;
            const sameVariant = variant?.variantId ? item.variantId === variant.variantId : (item.color === variant?.color && item.size === variant?.size);
            return sameProduct && sameVariant;
        });

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
                    // Store Variant Snapshot
                    variantId: variant?.variantId,
                    color: variant?.color,
                    size: variant?.size,
                    image: variant?.image,
                    price: variant?.price ?? 0
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

    async syncCart(userId: string, items: any[]) {
        let cart = await this.getCart(userId);

        // Transaction: Clear existing items -> Create new items
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

        for (const item of items) {
            let variantData = {
                color: item.color,
                size: item.size,
                price: item.price,
                image: item.image,
                variantId: item.variantId
            };

            // STRICT LOOKUP: If variantId is provided, fetch AUTHENTIC data from DB
            if (item.variantId) {
                const dbVariant = await prisma.productVariant.findUnique({
                    where: { id: item.variantId }
                });

                if (dbVariant) {
                    variantData.color = dbVariant.color;
                    variantData.size = dbVariant.size;
                    variantData.price = dbVariant.price;
                    variantData.image = dbVariant.image; // Use variant specific image
                    // If dbVariant has no image, maybe fallback? User says "Variant ... image".
                }
            } else if (item.selectedVariants) {
                // Fallback for Legacy/Frontend-only logic (if variantId missing)
                const keys = Object.keys(item.selectedVariants);
                const colorKey = keys.find(k => k.toLowerCase() === 'color' || k.toLowerCase() === 'colour');
                const sizeKey = keys.find(k => k.toLowerCase() === 'size');
                if (colorKey) variantData.color = item.selectedVariants[colorKey];
                if (sizeKey) variantData.size = item.selectedVariants[sizeKey];
            }

            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: item.id || item.productId,
                    quantity: item.quantity,

                    // CRITICAL SNAPSHOTS
                    price: variantData.price || item.price, // Trust DB variant price over payload if available
                    image: variantData.image || item.image || item.thumbnail || (item.images && item.images[0]),

                    color: variantData.color,
                    size: variantData.size,
                    variantId: variantData.variantId
                }
            });
        }

        return this.getCart(userId);
    }
}
