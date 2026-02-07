import { PrismaClient, Product, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ProductService {
    async createProduct(data: any) {
        // Map frontend fields to backend schema
        const title = data.name || data.title;
        const slug = (data.slug && data.slug !== '') ? data.slug : (title.toLowerCase().replace(/ /g, '-') + '-' + Date.now());

        // Extract allowed fields
        const { price, description, rating, isActive } = data;
        const stock = data.countInStock || data.stock || 0;
        const brand = data.brand || 'Generic'; // Default brand if missing

        // Handle Images & Thumbnail Logic
        let images = Array.isArray(data.images) ? data.images : [];
        // If legacy 'image' is provided and not in images array, add it
        if (data.image && !images.includes(data.image)) {
            images = [data.image, ...images];
        }

        // Determine thumbnail: Explicit > First Image > Empty
        const thumbnail = data.thumbnail || (images.length > 0 ? images[0] : null);

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
            } else {
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
                } catch (e) {
                    // If slug collision or race condition, fallback to default
                    const defaultCat = await prisma.category.findFirst();
                    categoryId = defaultCat?.id;
                }
            }
        }

        if (!categoryId) {
            const defaultCat = await prisma.category.findFirst();
            if (defaultCat) categoryId = defaultCat.id;
            else throw new AppError('Category not found and cannot be created', 400);
        }

        const product = await prisma.product.create({
            data: {
                title,
                slug,
                description: description || '',
                price: Number(price),
                stock: Number(stock),
                brand,
                images: images,
                thumbnail: thumbnail,
                rating: Number(rating) || 0,
                isActive: isActive !== undefined ? isActive : true,
                // @ts-ignore
                isFeatured: data.isFeatured || false,
                categoryId
            },
            include: { category: true }
        });

        // Return mapped object for frontend compatibility
        return {
            ...product,
            name: product.title,
            image: product.thumbnail || (product.images.length > 0 ? product.images[0] : ''),
            category: (product as any).category?.name || 'Unknown'
        };
    }

    async updateProduct(id: string, data: any) {
        const updateData: any = {};

        if (data.name) updateData.title = data.name;
        if (data.description) updateData.description = data.description;
        if (data.price) updateData.price = Number(data.price);
        if (data.stock !== undefined) updateData.stock = Number(data.stock);
        if (data.countInStock !== undefined) updateData.stock = Number(data.countInStock);

        // Image Update Logic
        if (data.images) {
            updateData.images = data.images;
            // If thumbnail not explicitly updated, verify current thumbnail still exists in new images? 
            // Simplest approach: If images updated, reset thumbnail to first new image unless specific thumbnail provided
            if (!data.thumbnail && data.images.length > 0) {
                updateData.thumbnail = data.images[0];
            }
        }
        if (data.thumbnail) updateData.thumbnail = data.thumbnail;
        // Legacy 'image' support - if user updates single image, treat as updating thumbnail + images list check
        if (data.image) {
            updateData.thumbnail = data.image;
            // We can't easily push to images array here without fetching first, 
            // relying on frontend sending full 'images' array for better sync.
        }

        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        // @ts-ignore
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
        if (data.brand) updateData.brand = data.brand;

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
            if (categoryDoc) updateData.categoryId = categoryDoc.id;
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: { category: true }
        });

        return {
            ...product,
            name: product.title,
            image: product.thumbnail || (product.images.length > 0 ? product.images[0] : ''),
            category: product.category?.name || 'Unknown'
        };
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
                variants: true,
            },
        });
        if (!product) throw new AppError('Product not found', 404);

        return {
            ...product,
            name: product.title,
            image: product.thumbnail || (product.images.length > 0 ? product.images[0] : ''),
            category: product.category?.name || 'Unknown'
        };
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
                include: { category: true, variants: true },
            }),
            prisma.product.count({ where }),
        ]);

        const mappedProducts = products.map((p: any) => ({
            ...p,
            name: p.title,
            image: p.thumbnail || (p.images.length > 0 ? p.images[0] : ''), // Map for frontend compatibility
            category: p.category?.name || 'Unknown'
        }));

        return { products: mappedProducts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
    }
}
