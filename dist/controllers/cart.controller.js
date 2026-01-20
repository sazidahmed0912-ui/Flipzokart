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
exports.CartController = void 0;
const cart_service_1 = require("../services/cart.service");
const catchAsync_1 = require("../utils/catchAsync");
const cartService = new cart_service_1.CartService();
class CartController {
    constructor() {
        this.getCart = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const cart = yield cartService.getCart(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        }));
        this.addToCart = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { productId, quantity } = req.body;
            const cart = yield cartService.addToCart(req.user.id, productId, quantity);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        }));
        this.updateCartItem = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { quantity } = req.body;
            const cart = yield cartService.updateCartItem(req.user.id, req.params.itemId, quantity);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        }));
        this.removeFromCart = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const cart = yield cartService.removeFromCart(req.user.id, req.params.itemId);
            res.status(200).json({
                status: 'success',
                data: { cart },
            });
        }));
    }
}
exports.CartController = CartController;
