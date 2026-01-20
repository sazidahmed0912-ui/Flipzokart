import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();
const cartController = new CartController();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update/:itemId', cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeFromCart);

export default router;
