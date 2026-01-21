import { PrismaClient, Product, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ProductService {
    async createProduct(data: any) {
        const title = data.name || data.title;
        const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        const { name, category, ...rest } = data;

        let categoryId;
        if (category) {
            const categoryDoc = await prisma.category.findFirst({
                where: {
                    OR: [
                        { name: { equals: category, mode: 'insensitive' } },
                        { slug: { equals: category, mode: 'insensitive' } }
                    ]
                }
            });
            if (categoryDoc) categoryId = categoryDoc.id;
        }

        if (!categoryId) {
            // Fallback or Error. For now, let's try to find 'Electronics' or first available
            const defaultCat = await prisma.category.findFirst();
            if (defaultCat) categoryId = defaultCat.id;
            else throw new AppError('Category not found', 400);
        }

        const product = await prisma.product.create({
            data: {
                ...rest,
                title,
                slug,
                categoryId,
            },
            include: { category: true }
        });
        return { ...product, name: product.title, category: product.category?.name || 'Unknown' };
    }

    async updateProduct(id: string, data: any) {
        const { name, category, ...rest } = data;
        const updateData: any = { ...rest };
        if (name) updateData.title = name;

        if (category) {
            const categoryDoc = await prisma.category.findFirst({
                where: {
                    OR: [
                        { name: { equals: category, mode: 'insensitive' } },
                        { slug: { equals: category, mode: 'insensitive' } }
                    ]
                }
            });
            if (categoryDoc) updateData.categoryId = categoryDoc.id;
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: { category: true }
        });
        return { ...product, name: product.title, category: product.category?.name || 'Unknown' };
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
        return { ...product, name: product.title, category: product.category?.name || 'Unknown' };
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

        const mappedProducts = products.map((p: any) => ({ ...p, name: p.title, category: p.category?.name || 'Unknown' }));

        return { products: mappedProducts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
    }
}
