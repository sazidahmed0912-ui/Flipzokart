import { PrismaClient, Product, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ProductService {
    async createProduct(data: any) {
        const title = data.name || data.title;
        const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        const { name, ...rest } = data; // Remove name from payload if present

        const product = await prisma.product.create({
            data: {
                ...rest,
                title,
                slug,
            },
        });
        return { ...product, name: product.title };
    }

    async updateProduct(id: string, data: any) {
        const { name, ...rest } = data;
        const updateData = { ...rest };
        if (name) updateData.title = name;

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
        });
        return { ...product, name: product.title };
    }

    async deleteProduct(id: string) {
        return await prisma.product.delete({
            where: { id },
        });
    }

    async getProduct(slugOrId: string) {
        // Check if input is a valid MongoDB ObjectId
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);

        const query = isObjectId ? { id: slugOrId } : { slug: slugOrId };

        const product = await prisma.product.findUnique({
            where: query,
            include: {
                category: true,
                reviews: true,
            },
        });
        if (!product) throw new AppError('Product not found', 404);
        return { ...product, name: product.title };
    }

    async getAllProducts(query: any) {
        const { page = 1, limit = 10, search, category, minPrice, maxPrice, sort } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: Prisma.ProductWhereInput = {
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

        const mappedProducts = products.map((p: any) => ({ ...p, name: p.title }));

        return { products: mappedProducts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
    }
}
