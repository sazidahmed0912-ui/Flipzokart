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
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
const catchAsync_1 = require("../utils/catchAsync");
const orderService = new order_service_1.OrderService();
class OrderController {
    constructor() {
        this.createOrder = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { addressId } = req.body;
            const order = yield orderService.createOrder(req.user.id, addressId);
            res.status(201).json({
                status: 'success',
                data: { order },
            });
        }));
        this.getOrder = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const order = yield orderService.getOrder(req.params.id);
            res.status(200).json({
                status: 'success',
                data: { order },
            });
        }));
        this.getUserOrders = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const orders = yield orderService.getUserOrders(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { orders },
            });
        }));
        this.updateOrderStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { status } = req.body;
            const order = yield orderService.updateOrderStatus(req.params.id, status);
            res.status(200).json({
                status: 'success',
                data: { order },
            });
        }));
    }
}
exports.OrderController = OrderController;
