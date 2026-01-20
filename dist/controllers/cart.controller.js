"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_service_1 = require("../services/cart.service");
const catchAsync_1 = require("../utils/catchAsync");
const cartService = new cart_service_1.CartService();
class CartController {
    constructor() {
        this.getCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const cart = await cartService.getCart(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        });
        this.addToCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { productId, quantity } = req.body;
            const cart = await cartService.addToCart(req.user.id, productId, quantity);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        });
        this.updateCartItem = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { quantity } = req.body;
            const cart = await cartService.updateCartItem(req.user.id, req.params.itemId, quantity);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        });
        this.removeFromCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const cart = await cartService.removeFromCart(req.user.id, req.params.itemId);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        });
    }
}
exports.CartController = CartController;
