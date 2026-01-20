import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

router.use(protect);

router.post('/checkout', orderController.createOrder); // /api/v1/orders/checkout
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

router.put('/:id/status', restrictTo('ADMIN'), orderController.updateOrderStatus);

export default router;
