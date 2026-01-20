"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const catchAsync_1 = require("../utils/catchAsync");
const userService = new user_service_1.UserService();
class UserController {
    constructor() {
        this.register = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { user, token } = yield userService.register(req.body);
            res.status(201).json({
                status: 'success',
                token,
                data: { user },
            });
        }));
        this.login = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { user, token, refreshToken } = yield userService.login(req.body);
            res.status(200).json({
                status: 'success',
                token,
                refreshToken,
                data: { user },
            });
        }));
        this.getProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Assuming req.user is set by auth middleware
            const userId = req.user.id;
            const user = yield userService.getProfile(userId);
            res.status(200).json({
                status: 'success',
                data: { user },
            });
        }));
    }
}
exports.UserController = UserController;
