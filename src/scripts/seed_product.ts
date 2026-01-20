
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProduct() {
    try {
        // Create Category first
        const category = await prisma.category.upsert({
            where: { slug: 'electronics' },
            update: {},
            create: {
                name: 'Electronics',
                slug: 'electronics',
            },
        });

        // Create Product
        const product = await prisma.product.create({
            data: {
                title: 'Test Smartphone',
                slug: `test-smartphone-${Date.now()}`,
                description: 'A helper product for testing.',
                price: 999.99,
                stock: 50,
                brand: 'TechBrand',
                categoryId: category.id,
                images: ['https://via.placeholder.com/150'],
                isActive: true,
            },
        });

        console.log(`Created product: ${product.title}`);
    } catch (error) {
        console.error('Error creating product:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedProduct();
