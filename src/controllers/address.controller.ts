import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class AddressController {
    addAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const { fullName, phone, street, addressLine2, city, state, pincode, type, isDefault } = req.body;

        if (!fullName || !phone || !street || !city || !state || !pincode || !type) {
            return next(new AppError('Please provide all mandatory fields', 400));
        }

        // If this is default, unmark others
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.create({
            data: {
                userId,
                fullName,
                phone,
                street,
                addressLine2,
                city,
                state,
                pincode,
                // @ts-ignore
                type,
                country: 'India', // Fixed as per requirement
                isDefault: isDefault || false
            }
        });

        res.status(201).json({
            status: 'success',
            data: { address }
        });
    });

    updateAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { fullName, phone, street, addressLine2, city, state, pincode, type, isDefault } = req.body;

        // If set as default, update others
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId, id: { not: id } },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.update({
            where: { id, userId }, // Ensure user owns address
            data: {
                fullName,
                phone,
                street,
                addressLine2,
                city,
                state,
                pincode,
                // @ts-ignore
                type,
                isDefault
            }
        });

        res.status(200).json({
            status: 'success',
            data: { address }
        });
    });

    deleteAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = (req as any).user.id;

        await prisma.address.delete({
            where: { id, userId }
        });

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    getAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;

        const addresses = await prisma.address.findMany({
            where: { userId }
        });

        res.status(200).json({
            status: 'success',
            data: { addresses }
        });
    });
}
