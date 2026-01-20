import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';

const prisma = new PrismaClient();

export class AdminController {
    getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const totalSales = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { paymentStatus: 'COMPLETED' }, // Assuming only paid orders count
        });

        const totalOrders = await prisma.order.count();
        const activeUsers = await prisma.user.count({ where: { isVerified: true } });

        // Low stock products
        const lowStockProducts = await prisma.product.count({
            where: { stock: { lt: 10 } },
        });

        res.status(200).json({
            status: 'success',
            data: {
                totalSales: totalSales._sum.totalAmount || 0,
                totalOrders,
                activeUsers,
                lowStockProducts,
            },
        });
    });
}
