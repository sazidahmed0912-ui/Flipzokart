import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

router.post('/', protect, reviewController.createReview);

export default router;
