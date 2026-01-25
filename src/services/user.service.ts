import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import geolocationService from './geolocation.service';

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
            expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any, // Cast to any to resolve overload issue
        });
    }

    generateRefreshToken(id: string) {
        return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret', {
            expiresIn: '7d' as any,
        });
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        return user;
    }

    async submitAppeal(userId: string, message: string, ip: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new AppError('User not found', 404);
        }

        await prisma.activity.create({
            data: {
                userId,
                type: 'appeal',
                message: `User Appeal: ${message}`,
                ip: String(ip)
            }
        });

        return { message: 'Appeal submitted successfully' };
    }

    async updateAvatar(userId: string, avatarPath: string) {
        // Construct full URL or relative path? Frontend usually expects URL.
        // For now, we store relative path 'uploads/filename...'.
        // We'll assume the backend serves 'uploads' folder statically.

        // We might want to clear old avatar if exists to save space (omitted for safety).
        return await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarPath }, // Ensure 'avatar' field exists in schema or we add it? 'types.ts' has it. Model?
        });
    }

    async updateUserLocation(userId: string, ipAddress: string) {
        // Get location data from IP
        const locationData = await geolocationService.getLocationFromIP(ipAddress);

        if (!locationData) {
            throw new AppError('Could not determine location', 500);
        }

        // Update user with location data
        return await prisma.user.update({
            where: { id: userId },
            data: {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                city: locationData.city,
                country: locationData.country,
                countryCode: locationData.countryCode,
                ipAddress: ipAddress,
                lastLocationUpdate: new Date(),
            },
        });
    }

    async getActiveUsersMapData() {
        // Get all users with location data (recent activity within last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const users = await prisma.user.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null },
                lastLocationUpdate: {
                    gte: twentyFourHoursAgo,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                latitude: true,
                longitude: true,
                city: true,
                country: true,
                countryCode: true,
                lastLocationUpdate: true,
            },
        });

        return users;
    }
}
