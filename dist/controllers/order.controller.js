"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
const catchAsync_1 = require("../utils/catchAsync");
const orderService = new order_service_1.OrderService();
class OrderController {
    constructor() {
        this.createOrder = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { addressId } = req.body;
            const order = await orderService.createOrder(req.user.id, addressId);
            res.status(201).json({
                status: 'success',
                data: { order },
            });
        });
        this.getOrder = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const order = await orderService.getOrder(req.params.id);
            res.status(200).json({
                status: 'success',
                data: { order },
            });
        });
        this.getUserOrders = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const orders = await orderService.getUserOrders(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { orders },
            });
        });
        this.updateOrderStatus = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { status } = req.body;
            const order = await orderService.updateOrderStatus(req.params.id, status);
            res.status(200).json({
                status: 'success',
                data: { order },
            });
        });
    }
}
exports.OrderController = OrderController;
