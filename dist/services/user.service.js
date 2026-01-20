"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class UserService {
    async register(data) {
        const { name, email, password, phone } = data;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError_1.AppError('Email already in use', 400);
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
            },
        });
        const token = this.generateToken(user.id, user.role);
        return { user, token };
    }
    async login(data) {
        const { email, password } = data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            throw new AppError_1.AppError('Invalid email or password', 401);
        }
        const token = this.generateToken(user.id, user.role);
        const refreshToken = this.generateRefreshToken(user.id);
        return { user, token, refreshToken };
    }
    generateToken(id, role) {
        return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1d'), // Cast to any to resolve overload issue
        });
    }
    generateRefreshToken(id) {
        return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret', {
            expiresIn: '7d',
        });
    }
    async getProfile(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new AppError_1.AppError('User not found', 404);
        return user;
    }
}
exports.UserService = UserService;
