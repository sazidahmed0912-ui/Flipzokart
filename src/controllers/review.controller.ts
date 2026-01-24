import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { catchAsync } from '../utils/catchAsync';

const reviewService = new ReviewService();

export class ReviewController {
    createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const review = await reviewService.createReview(userId, req.body);

        // Map response to match frontend Review interface
        // frontend expects: _id, product: { _id, name }
        const formatted = {
            ...review,
            _id: review.id,
            product: {
                _id: review.productId,
                name: (review.product as any).title // Prisma returns 'title', cast to any if TS complains or extend type
            }
        };

        res.status(201).json({
            status: 'success',
            data: formatted,
        });
    });
}
