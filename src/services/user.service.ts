import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class UserService {
    async register(data: any) {
        const { name, email, password, phone } = data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

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

    async login(data: any) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = this.generateToken(user.id, user.role);
        const refreshToken = this.generateRefreshToken(user.id);

        return { user, token, refreshToken };
    }

    generateToken(id: string, role: string) {
        return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        });
    }

    generateRefreshToken(id: string) {
        return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret', {
            expiresIn: '7d',
        });
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        return user;
    }
}
