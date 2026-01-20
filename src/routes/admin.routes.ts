import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const adminController = new AdminController();

router.use(protect, restrictTo('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/dashboard-stats', adminController.getDashboardStats);

export default router;
