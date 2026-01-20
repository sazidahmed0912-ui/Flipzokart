import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const prisma = new PrismaClient();

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer does exist.', 401));
    }

    (req as any).user = currentUser;
    next();
});

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req as any).user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
