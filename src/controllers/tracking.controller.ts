import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const prisma = new PrismaClient();
// Refreshed client

export class TrackingController {
    getTrackingDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { trackingId } = req.params;

        // Try to find by trackingId first, then by orderNumber (as fallback if entered manually)
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    // @ts-ignore
                    { trackingId: trackingId },
                    // @ts-ignore
                    { orderNumber: trackingId },
                    // @ts-ignore
                    { id: trackingId } // Support lookup by DB ID
                ]
            },
            include: {
                // Include limited details for public tracking
                items: {
                    select: {
                        quantity: true,
                        product: {
                            select: {
                                title: true,
                                images: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return next(new AppError('Tracking ID not found', 404));
        }

        // Return only necessary info
        res.status(200).json({
            status: 'success',
            data: {
                // @ts-ignore
                trackingId: order.trackingId,
                // @ts-ignore
                orderNumber: order.orderNumber,
                status: order.orderStatus,
                expectedDelivery: '3-5 Business Days', // Placeholder or calculation
                updatedAt: order.updatedAt,
                shippingFrom: 'Morigaon, Assam',
                shippingTo: typeof order.address === 'object' ? (order.address as any).city : 'Destination',
                events: [
                    // Generate a history based on current status (simplified)
                    { status: 'Order Placed', date: order.createdAt, completed: true },
                    { status: 'Packed', date: null, completed: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus) },
                    { status: 'Shipped', date: null, completed: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus) },
                    { status: 'Out for Delivery', date: null, completed: order.orderStatus === 'DELIVERED' }, // Simplified
                    { status: 'Delivered', date: null, completed: order.orderStatus === 'DELIVERED' }
                ]
            }
        });
    });
}
