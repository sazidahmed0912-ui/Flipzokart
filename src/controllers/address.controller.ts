import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class AddressController {
    addAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        console.log(`[AddressController] Add Address Request: User=${userId}`, req.body);
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
        console.log(`[AddressController] Update Address Request: ID=${id} User=${userId}`, req.body);
        const { fullName, phone, street, addressLine2, city, state, pincode, type, isDefault } = req.body;

        // If set as default, update others
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId, id: { not: id as string } },
                data: { isDefault: false }
            });
        }


        const existingAddress = await prisma.address.findUnique({
            where: { id: id as string, userId }
        });

        if (!existingAddress) {
            return next(new AppError('Address not found', 404));
        }

        const address = await prisma.address.update({
            where: { id: id as string, userId }, // Ensure user owns address
            data: {
                fullName: fullName || existingAddress.fullName,
                phone: phone || existingAddress.phone,
                street: street || existingAddress.street,
                addressLine2: addressLine2 !== undefined ? addressLine2 : existingAddress.addressLine2,
                city: city || existingAddress.city,
                state: state || existingAddress.state,
                pincode: pincode || existingAddress.pincode,
                // @ts-ignore
                type: type || existingAddress.type,
                isDefault: isDefault !== undefined ? isDefault : existingAddress.isDefault
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
            where: { id: id as string, userId }
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

    getAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const address = await prisma.address.findUnique({
            where: { id: id as string, userId }
        });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { address }
        });
    });
}
