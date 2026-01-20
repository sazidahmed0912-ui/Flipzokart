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
exports.CartService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class CartService {
    getCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let cart = yield prisma.cart.findUnique({
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
                cart = yield prisma.cart.create({
                    data: { userId },
                    include: { items: { include: { product: true } } },
                });
            }
            return cart;
        });
    }
    addToCart(userId, productId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            let cart = yield this.getCart(userId);
            const existingItem = cart.items.find((item) => item.productId === productId);
            if (existingItem) {
                yield prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + quantity },
                });
            }
            else {
                yield prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity,
                    },
                });
            }
            return this.getCart(userId);
        });
    }
    updateCartItem(userId, itemId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield this.getCart(userId);
            const item = cart.items.find((i) => i.id === itemId);
            if (!item)
                throw new AppError_1.AppError('Item not found in cart', 404);
            if (quantity <= 0) {
                yield prisma.cartItem.delete({ where: { id: itemId } });
            }
            else {
                yield prisma.cartItem.update({
                    where: { id: itemId },
                    data: { quantity },
                });
            }
            return this.getCart(userId);
        });
    }
    removeFromCart(userId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield this.getCart(userId);
            const item = cart.items.find((i) => i.id === itemId);
            if (!item)
                throw new AppError_1.AppError('Item not found in cart', 404);
            yield prisma.cartItem.delete({ where: { id: itemId } });
            return this.getCart(userId);
        });
    }
}
exports.CartService = CartService;
