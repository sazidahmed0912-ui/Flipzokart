import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// In-memory OTP store (keyed by email)
// For production, use Redis. This is sufficient for now.
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

// ─── Mailer Setup ────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export class SellerAuthService {
    /**
     * Generate a 6-digit OTP and send it to seller email.
     * Seller must already be registered in the DB (role = 'seller').
     */
    async sendSellerOtp(email: string): Promise<void> {
        // Check seller exists
        const seller = await prisma.user.findUnique({ where: { email } });
        if (!seller) {
            throw new AppError('No account found with this email. Please register first.', 404);
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        otpStore.set(email, { otp, expiresAt });

        // Send OTP via email
        await transporter.sendMail({
            from: `"Fzokart Seller" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Fzokart Seller Panel – Your OTP',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:16px;">
                    <div style="background:#2874F0;color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
                        <h2 style="margin:0;font-size:22px;">Fzokart Seller Panel</h2>
                    </div>
                    <p style="color:#374151;font-size:15px;">Your One-Time Password (OTP) for Seller Panel login:</p>
                    <div style="background:#f3f4f6;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
                        <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#1e3a8a;">${otp}</span>
                    </div>
                    <p style="color:#9ca3af;font-size:12px;">Valid for 5 minutes. Do not share this OTP with anyone.</p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
                    <p style="color:#6b7280;font-size:12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });
    }

    /**
     * Verify OTP and return a seller-specific JWT signed with JWT_SELLER_SECRET.
     * This token is COMPLETELY SEPARATE from user tokens.
     */
    async verifySellerOtp(email: string, otp: string): Promise<{ sellerToken: string; seller: any }> {
        const record = otpStore.get(email);

        if (!record) {
            throw new AppError('OTP not found. Please request a new OTP.', 400);
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            throw new AppError('OTP has expired. Please request a new one.', 400);
        }

        if (record.otp !== otp) {
            throw new AppError('Invalid OTP. Please try again.', 400);
        }

        // OTP valid — clear it
        otpStore.delete(email);

        // Fetch seller
        const seller = await prisma.user.findUnique({ where: { email } });
        if (!seller) {
            throw new AppError('Seller account not found.', 404);
        }

        // ✅ Sign with SELLER-SPECIFIC SECRET — completely separate from user tokens
        const sellerToken = jwt.sign(
            { id: seller.id, role: 'seller', type: 'seller_panel' },
            process.env.JWT_SELLER_SECRET || 'sellerFallbackSecret',
            { expiresIn: '7d' }
        );

        return {
            sellerToken,
            seller: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
                role: seller.role,
            },
        };
    }
}
