import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

// ──────────────────────────────────────────────────────────────
// 🔥 PREVIEW (The ONLY calculation point)
// Public-ish: no auth required for preview (coupon validation requires auth)
// POST /api/orders/preview
// ──────────────────────────────────────────────────────────────
router.post('/preview', protect, orderController.previewOrder);

// Guarded routes
router.use(protect);

// POST /api/orders/checkout — hash-verified, no recalculation
router.post('/checkout', orderController.createOrder);

router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);

router.put('/:id/status', restrictTo('ADMIN'), orderController.updateOrderStatus);

export default router;
