import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';

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
}
