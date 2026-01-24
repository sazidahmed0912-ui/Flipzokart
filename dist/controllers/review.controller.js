"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
const catchAsync_1 = require("../utils/catchAsync");
const reviewService = new review_service_1.ReviewService();
class ReviewController {
    constructor() {
        this.createReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const userId = req.user.id;
            const review = await reviewService.createReview(userId, req.body);
            // Map response to match frontend Review interface
            // frontend expects: _id, product: { _id, name }
            const formatted = {
                ...review,
                _id: review.id,
                product: {
                    _id: review.productId,
                    name: review.product.title // Prisma returns 'title', cast to any if TS complains or extend type
                }
            };
            res.status(201).json({
                status: 'success',
                data: formatted,
            });
        });
    }
}
exports.ReviewController = ReviewController;
