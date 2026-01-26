import { Router } from 'express';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import chatRoutes from './chat.routes';
import adminRoutes from './admin.routes';
import reviewRoutes from './review.routes';
import trackingRoutes from './tracking.routes';

const router = Router();

router.use('/auth', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);
router.use('/tracking', trackingRoutes); // Public tracking

export default router;
