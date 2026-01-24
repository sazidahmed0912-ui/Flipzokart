"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const userService = new user_service_1.UserService();
class UserController {
    constructor() {
        this.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { user, token } = await userService.register(req.body);
            res.status(201).json({
                status: 'success',
                token,
                data: { user },
            });
        });
        this.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const { user, token, refreshToken } = await userService.login(req.body);
            res.status(200).json({
                status: 'success',
                token,
                refreshToken,
                data: { user },
            });
        });
        this.getProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            // Assuming req.user is set by auth middleware
            const userId = req.user.id;
            const user = await userService.getProfile(userId);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        });
        this.submitAppeal = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const userId = req.user.id;
            const { message } = req.body;
            const ip = req.ip || '';
            await userService.submitAppeal(userId, message, ip);
            res.status(200).json({
                status: 'success',
                message: 'Appeal submitted successfully',
            });
        });
        this.uploadAvatar = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            if (!req.file) {
                return next(new AppError_1.AppError('Please upload a file', 400));
            }
            const userId = req.user.id;
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
    }
}
exports.UserController = UserController;
