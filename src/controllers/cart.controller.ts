import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { catchAsync } from '../utils/catchAsync';

const cartService = new CartService();

export class CartController {
    getCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const cart = await cartService.getCart((req as any).user.id);
        res.status(200).json({
            status: 'success',
            data: { cart },
        });
    });

    addToCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { productId, quantity, variantId, color, size, image, price } = req.body;
        const cart = await cartService.addToCart((req as any).user.id, productId, quantity, { variantId, color, size, image, price });
        res.status(200).json({
            status: 'success',
            data: { cart },
        });
    });

    updateCartItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { quantity } = req.body;
        const cart = await cartService.updateCartItem((req as any).user.id, req.params.itemId as string, quantity);
        res.status(200).json({
            status: 'success',
            data: { cart },
        });
    });

    removeFromCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const cart = await cartService.removeFromCart((req as any).user.id, req.params.itemId as string);
        res.status(200).json({
            status: 'success',
            data: { cart },
        });
    });
    syncCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { cart } = req.body; // Expecting { cart: [...] }
        const updatedCart = await cartService.syncCart((req as any).user.id, cart || []);
        res.status(200).json({
            status: 'success',
            data: { cart: updatedCart },
        });
    });
}
