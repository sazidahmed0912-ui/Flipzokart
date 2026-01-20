"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
router.use(auth_middleware_1.protect);
router.post('/checkout', orderController.createOrder); // /api/v1/orders/checkout
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', (0, auth_middleware_1.restrictTo)('ADMIN'), orderController.updateOrderStatus);
exports.default = router;
