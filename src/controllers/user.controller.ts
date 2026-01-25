import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const userService = new UserService();

export class UserController {
    register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { user, token } = await userService.register(req.body);
        res.status(201).json({
            status: 'success',
            token,
            data: { user },
        });
    });

    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { user, token, refreshToken } = await userService.login(req.body);
        res.status(200).json({
            status: 'success',
            token,
            refreshToken,
            data: { user },
        });
    });

    getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        // Assuming req.user is set by auth middleware
        const userId = (req as any).user.id;
        const user = await userService.getProfile(userId);
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    });

    submitAppeal = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const { message } = req.body;
        const ip = req.ip || '';

        await userService.submitAppeal(userId, message, ip);

        res.status(200).json({
            status: 'success',
            message: 'Appeal submitted successfully',
        });
    });

    uploadAvatar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.file) {
            return next(new AppError('Please upload a file', 400));
        }

        const userId = (req as any).user.id;
        const avatarPath = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows

        // Update user avatar in DB
        const updatedUser = await userService.updateAvatar(userId, avatarPath);

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser,
                path: avatarPath
            }
        });
    });

    updateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user.id;
        const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
            req.headers['x-real-ip']?.toString() ||
            req.socket.remoteAddress ||
            '127.0.0.1';

        const updatedUser = await userService.updateUserLocation(userId, ipAddress);

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser },
        });
    });

    getMapData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const mapData = await userService.getActiveUsersMapData();

        res.status(200).json({
            status: 'success',
            data: { users: mapData },
        });
    });
}
