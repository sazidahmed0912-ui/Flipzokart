import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { OrderService } from '../services/order.service';
import { AppError } from '../utils/AppError';
import { OrderStatus } from '@prisma/client';

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

    updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { status } = req.body;

        // Validate Status
        const allowedStatuses = [
            'PENDING',
            'CONFIRMED',
            'PACKED',
            'SHIPPED',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED',
            'RETURNED'
        ];

        if (!allowedStatuses.includes(status)) {
            return next(new AppError(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400));
        }

        const orderService = new OrderService();
        const order = await orderService.updateOrderStatus(id as string, status as OrderStatus);

        res.status(200).json({
            status: 'success',
            data: { order }
        });
    });
}
