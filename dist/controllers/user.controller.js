"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const catchAsync_1 = require("../utils/catchAsync");
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
    }
}
exports.UserController = UserController;
