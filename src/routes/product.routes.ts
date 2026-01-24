import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProduct);

router.use(protect, restrictTo('ADMIN'));

router.post('/', productController.createProduct);
router.post('/add', productController.createProduct); // Fallback for cached frontends
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
