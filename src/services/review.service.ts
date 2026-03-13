import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ReviewService {
    async createReview(userId: string, data: any) {
        const { product: productId, rating, comment, images, video } = data;

        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new AppError('Product not found', 404);
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
            throw new AppError('You have already reviewed this product', 400);
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                userId,
                productId,
                rating: Number(rating),
                comment,
                images: Array.isArray(images) ? images : [],
                video: video || null,
                isApproved: false // Requires admin approval, defaults to false
            } as any,
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

    async updateProductRating(productId: string) {
        const reviews = await prisma.review.findMany({ where: { productId, isApproved: true } as any });
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

    // Admin Methods
    async getAllReviewsAdmin() {
        return await prisma.review.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, title: true, thumbnail: true, images: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateReviewStatus(id: string, isApproved: boolean) {
        const review = await prisma.review.update({
            where: { id },
            data: { isApproved } as any
        });
        await this.updateProductRating(review.productId);
        return review;
    }

    async deleteReviewAdmin(id: string) {
        const review = await prisma.review.delete({
            where: { id }
        });
        await this.updateProductRating(review.productId);
        return review;
    }
}
