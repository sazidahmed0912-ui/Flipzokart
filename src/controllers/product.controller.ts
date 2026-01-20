import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';

const productService = new ProductService();

export class ProductController {
    createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const product = await productService.createProduct(req.body);
        res.status(201).json({
            status: 'success',
            data: { product },
        });
    });

    updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const product = await productService.updateProduct(req.params.id as string, req.body);
        res.status(200).json({
            status: 'success',
            data: { product },
        });
    });

    deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await productService.deleteProduct(req.params.id as string);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

    getProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const product = await productService.getProduct(req.params.slug as string);
        res.status(200).json({
            status: 'success',
            data: { product },
        });
    });

    getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const result = await productService.getAllProducts(req.query);
        res.status(200).json({
            status: 'success',
            ...result,
        });
    });
}
