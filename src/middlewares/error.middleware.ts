import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const globalErrorHandler = (
    err: AppError | Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err;

    if (!(error instanceof AppError)) {
        const statusCode = (error as any).statusCode || 500;
        const message = error.message || 'Something went wrong';
        error = new AppError(message, statusCode);
    }

    const statusCode = (error as AppError).statusCode || 500;

    res.status(statusCode).json({
        status: (error as AppError).status || 'error',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
