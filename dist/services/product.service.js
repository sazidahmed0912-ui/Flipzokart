"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class ProductService {
    async createProduct(data) {
        // Map frontend fields to backend schema
        const title = data.name || data.title;
        const slug = (data.slug && data.slug !== '') ? data.slug : (title.toLowerCase().replace(/ /g, '-') + '-' + Date.now());
        // Extract allowed fields
        const { price, description, images, rating, isActive } = data;
        const stock = data.countInStock || data.stock || 0;
        const brand = data.brand || 'Generic'; // Default brand if missing
        // Handle Category
        let categoryId;
        const categoryInput = data.category;
        if (categoryInput) {
            // Try to find existing category
            const categoryDoc = await prisma.category.findFirst({
                where: {
                    OR: [
                        { name: { equals: categoryInput, mode: 'insensitive' } },
                        { slug: { equals: categoryInput, mode: 'insensitive' } }
                    ]
                }
            });
            if (categoryDoc) {
                categoryId = categoryDoc.id;
            }
            else {
                // Auto-create category if not found to prevent errors
                const newCatSlug = categoryInput.toLowerCase().replace(/ /g, '-');
                try {
                    const newCat = await prisma.category.create({
                        data: {
                            name: categoryInput,
                            slug: newCatSlug
                        }
                    });
                    categoryId = newCat.id;
                }
                catch (e) {
                    // If slug collision or race condition, fallback to default
                    const defaultCat = await prisma.category.findFirst();
                    categoryId = defaultCat?.id;
                }
            }
        }
        if (!categoryId) {
            const defaultCat = await prisma.category.findFirst();
            if (defaultCat)
                categoryId = defaultCat.id;
            else
                throw new AppError_1.AppError('Category not found and cannot be created', 400);
        }
        const product = await prisma.product.create({
            data: {
                title,
                slug,
                description: description || '',
                price: Number(price),
                stock: Number(stock),
                brand,
                images: images || [],
                rating: Number(rating) || 0,
                isActive: isActive !== undefined ? isActive : true,
                categoryId
            },
            include: { category: true }
        });
        return { ...product, name: product.title, category: product.category?.name || 'Unknown' };
    }
    async updateProduct(id, data) {
        const updateData = {};
        if (data.name)
            updateData.title = data.name;
        if (data.description)
            updateData.description = data.description;
        if (data.price)
            updateData.price = Number(data.price);
        if (data.stock !== undefined)
            updateData.stock = Number(data.stock);
        if (data.countInStock !== undefined)
            updateData.stock = Number(data.countInStock);
        if (data.images)
            updateData.images = data.images;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.brand)
            updateData.brand = data.brand;
        const categoryInput = data.category;
        if (categoryInput) {
            const categoryDoc = await prisma.category.findFirst({
                where: {
                    OR: [
                        { name: { equals: categoryInput, mode: 'insensitive' } },
                        { slug: { equals: categoryInput, mode: 'insensitive' } }
                    ]
                }
            });
            if (categoryDoc)
                updateData.categoryId = categoryDoc.id;
        }
        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: { category: true }
        });
        return { ...product, name: product.title, category: product.category?.name || 'Unknown' };
    }
    async deleteProduct(id) {
        return await prisma.product.delete({
            where: { id },
        });
    }
    async getProduct(slugOrId) {
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
        if (!product)
            throw new AppError_1.AppError('Product not found', 404);
        return { ...product, name: product.title, category: product.category?.name || 'Unknown' };
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
        const mappedProducts = products.map((p) => ({ ...p, name: p.title, category: p.category?.name || 'Unknown' }));
        return { products: mappedProducts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
    }
}
exports.ProductService = ProductService;
