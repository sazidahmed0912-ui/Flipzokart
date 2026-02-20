import { Router } from 'express';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import chatRoutes from './chat.routes';
import adminRoutes from './admin.routes';
import reviewRoutes from './review.routes';
import trackingRoutes from './tracking.routes';
import addressRoutes from './address.routes';
import sellerAuthRoutes from './seller.auth.routes';

const router = Router();

router.use('/auth', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewRoutes);
router.use('/tracking', trackingRoutes); // Public tracking
router.use('/user/address', addressRoutes);
// ✅ SEPARATE Seller Auth — never conflicts with user auth
router.use('/seller/auth', sellerAuthRoutes);

export default router;
