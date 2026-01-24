"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class ReviewService {
    async createReview(userId, data) {
        const { product: productId, rating, comment } = data;
        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        // Check for existing review
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
        if (existingReview) {
            throw new AppError_1.AppError('You have already reviewed this product', 400);
        }
        // Create review
        const review = await prisma.review.create({
            data: {
                userId,
                productId,
                rating: Number(rating),
                comment
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        title: true // Prisma schema has 'title', need to check if frontend expects 'name'. Frontend type has 'name'. Prisma schema 'title'.
                    }
                }
            }
        });
        // Update product rating
        await this.updateProductRating(productId);
        // Return review in format frontend expects
        return review;
    }
    async updateProductRating(productId) {
        const reviews = await prisma.review.findMany({ where: { productId } });
        if (reviews.length === 0) {
            await prisma.product.update({
                where: { id: productId },
                data: { rating: 0 }
            });
            return;
        }
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await prisma.product.update({
            where: { id: productId },
            data: { rating: avgRating }
        });
    }
}
exports.ReviewService = ReviewService;
