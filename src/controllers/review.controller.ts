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
                name: (review as any).product.title 
            }
        };

        res.status(201).json({
            status: 'success',
            data: formatted,
        });
    });

    getAllReviewsAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const reviews = await reviewService.getAllReviewsAdmin();

        const formatted = reviews.map(r => ({
            ...r,
            _id: r.id,
            product: r.product ? {
                _id: r.productId,
                name: (r.product as any).title,
                image: (r.product as any).thumbnail || ((r.product as any).images.length > 0 ? (r.product as any).images[0] : '')
            } : null
        }));

        res.status(200).json({
            status: 'success',
            data: formatted
        });
    });

    updateReviewStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const { isApproved } = req.body;

        const review = await reviewService.updateReviewStatus(id, isApproved);

        res.status(200).json({
            status: 'success',
            message: 'Review status updated successfully',
            data: review
        });
    });

    deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;

        await reviewService.deleteReviewAdmin(id);

        res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    });
}
