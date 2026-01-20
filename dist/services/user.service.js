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
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, phone } = data;
            const existingUser = yield prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new AppError_1.AppError('Email already in use', 400);
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 12);
            const user = yield prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                },
            });
            const token = this.generateToken(user.id, user.role);
            return { user, token };
        });
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = data;
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
                throw new AppError_1.AppError('Invalid email or password', 401);
            }
            const token = this.generateToken(user.id, user.role);
            const refreshToken = this.generateRefreshToken(user.id);
            return { user, token, refreshToken };
        });
    }
    generateToken(id, role) {
        return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        });
    }
    generateRefreshToken(id) {
        return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret', {
            expiresIn: '7d',
        });
    }
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new AppError_1.AppError('User not found', 404);
            return user;
        });
    }
}
exports.UserService = UserService;
