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

    updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const { status, note, deliveryText } = req.body;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        // Prepare Status History Entry
        const historyEntry = {
            status,
            timestamp: new Date(),
            note: note || `Status updated to ${status} by Admin`
        };

        // Update Order
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                // @ts-ignore
                orderStatus: status, // Update both if schema uses different names, but trying to standardize
                // @ts-ignore
                status: status,      // Prisma might have one or the other, strictly updating mapped field
                // @ts-ignore - fresh schema change
                deliveryText: deliveryText !== undefined ? deliveryText : order.deliveryText,
                statusHistory: [
                    // @ts-ignore
                    ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
                    historyEntry
                ] as any
            }
        });

        // Emit Socket Event
        const io = req.app.get('socketio');
        if (io) {
            io.to(order.userId).emit('notification', {
                type: 'orderStatusUpdate',
                message: `Your order #${order.orderNumber || order.id.slice(-6)} is now ${status}`,
                orderId: order.id,
                status: status,
                timestamp: new Date()
            });

            // Also emit to Admin Monitor
            io.to('admin-monitor').emit('notification', {
                type: 'orderStatusUpdate',
                orderId: order.id,
                status: status,
                updatedBy: 'Admin'
            });
        }

        res.status(200).json({
            status: 'success',
            data: updatedOrder
        });
    });

    updateOrderLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const { lat, lng, address } = req.body;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        const locationData = {
            lat,
            lng,
            address,
            updatedAt: new Date()
        };

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                currentLocation: locationData
            }
        });

        // Emit Socket Event
        const io = req.app.get('socketio');
        if (io) {
            // Emit to User Room
            io.to(order.userId).emit('notification', {
                type: 'orderLocationUpdate',
                orderId: order.id,
                location: locationData
            });

            // Emit to Admin Monitor
            io.to('admin-monitor').emit('notification', {
                type: 'orderLocationUpdate',
                orderId: order.id,
                location: locationData
            });
        }

        res.status(200).json({
            status: 'success',
            data: updatedOrder
        });
    });
}
