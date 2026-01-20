import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync';

const orderService = new OrderService();

export class OrderController {
    createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { addressId } = req.body;
        const order = await orderService.createOrder((req as any).user.id, addressId);
        res.status(201).json({
            status: 'success',
            data: { order },
        });
    });

    getOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const order = await orderService.getOrder(req.params.id as string);
        res.status(200).json({
            status: 'success',
            data: { order },
        });
    });

    getUserOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const orders = await orderService.getUserOrders((req as any).user.id);
        res.status(200).json({
            status: 'success',
            data: { orders },
        });
    });

    updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id as string, status);
        res.status(200).json({
            status: 'success',
            data: { order },
        });
    });
}
