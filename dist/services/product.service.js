"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class ProductService {
    async createProduct(data) {
        const slug = data.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        return await prisma.product.create({
            data: {
                ...data,
                slug,
            },
        });
    }
    async updateProduct(id, data) {
        return await prisma.product.update({
            where: { id },
            data,
        });
    }
    async deleteProduct(id) {
        return await prisma.product.delete({
            where: { id },
        });
    }
    async getProduct(slug) {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                reviews: true,
            },
        });
        if (!product)
            throw new AppError_1.AppError('Product not found', 404);
        return product;
    }
    async getAllProducts(query) {
        const { page = 1, limit = 10, search, category, minPrice, maxPrice, sort } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            isActive: true,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(category && { category: { slug: category } }),
            ...(minPrice && { price: { gte: Number(minPrice) } }),
            ...(maxPrice && { price: { lte: Number(maxPrice) } }),
        };
        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                take: Number(limit),
                skip,
                orderBy: sort ? { price: sort === 'price-asc' ? 'asc' : 'desc' } : { createdAt: 'desc' },
                include: { category: true },
            }),
            prisma.product.count({ where }),
        ]);
        return { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
    }
}
exports.ProductService = ProductService;
