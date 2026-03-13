import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

// Admin routes
router.get('/admin/all', protect, restrictTo('ADMIN'), reviewController.getAllReviewsAdmin);
router.patch('/:id/status', protect, restrictTo('ADMIN'), reviewController.updateReviewStatus);
router.delete('/:id', protect, restrictTo('ADMIN'), reviewController.deleteReview);

// User routes
router.post('/', protect, reviewController.createReview);

export default router;
