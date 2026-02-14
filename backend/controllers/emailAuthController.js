const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmailService = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// SEND EMAIL OTP
const sendEmailOtp = async (req, res) => {
    try {
        const { email, name, type } = req.body; // 'login' or 'seller_register'

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // 🟢 PRE-CHECK: Duplicate Signup Block (Master Fix)
        if (type === 'signup') {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(409).json({ message: "This email is already registered. Please log in." });
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete old OTP if exists
        await Otp.findOneAndDelete({ email });

        await Otp.create({
            email,
            otp,
        });

        // Email Templates
        let emailSubject = 'Your Login OTP for Fzokart';
        let emailHtml = '';

        if (type === 'seller_register') {
            const sellerName = name || 'Seller';
            emailSubject = 'Verify Your Seller Account – OTP Confirmation | Fzokart';
            emailHtml = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <p style="font-size: 16px;">Hello <strong>${sellerName}</strong>,</p>
                <p style="font-size: 16px;">Thank you for registering as a seller on Fzokart.</p>
                <p style="font-size: 16px;">To complete your seller account registration, please verify your email address using the One-Time Password (OTP) below:</p>
                
                <p style="font-size: 16px; font-weight: bold; margin-top: 25px;">🔐 Your OTP Code:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #2874F0; margin: 10px 0 25px 0;">
                ${otp}
                </div>
                
                <p style="font-size: 14px; color: #555;">This OTP is valid for 5 minutes only.</p>
                <p style="font-size: 14px; color: #555;">For security reasons, please do not share this OTP with anyone.</p>
                <p style="font-size: 14px; color: #555;">If you did not request this verification, please ignore this email.</p>
                <p style="font-size: 16px; margin-top: 25px;">Once verified, you can start listing products and selling on Fzokart.</p>
                
                <br/>
                <p style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">Best regards,</p>
                <p style="font-size: 16px; margin-top: 0;">Team Fzokart<br/><span style="font-size: 14px; font-weight: normal; color: #666;">Empowering sellers to grow online</span></p>
            </div>
            `;
        } else {
            // Default Login OTP
            emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2874F0;">Fzokart Login Verification</h2>
                <p>Hello,</p>
                <p>Your One-Time Password (OTP) for login is:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
                ${otp}
                </div>
                <p>This OTP is valid for 5 minutes. Do not share this with anyone.</p>
                <p>If you didn't request this code, you can ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Fzokart. All rights reserved.</p>
            </div>
            `;
        }

        // Send Email
        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email"
        });

        // Send Email (Non-blocking)
        sendEmailService.sendEmail(email, emailSubject, emailHtml).catch(err => {
            console.error("Background Email Error:", err.message);
        });

    } catch (error) {
        console.error("Store OTP Error:", error);
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

// VERIFY EMAIL OTP
const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp, name, phone, password } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const validOtp = await Otp.findOne({ email, otp });

        if (!validOtp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP Verified. Delete it.
        await Otp.deleteOne({ _id: validOtp._id });

        // Find or Create User
        let user = await User.findOne({ email });

        if (!user) {
            // New User Registration

            // Hash password if provided
            let hashedPassword = undefined;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(password, salt);
            }

            user = await User.create({
                email,
                name: name || email.split('@')[0], // Use provided name or default to email prefix
                phone: phone || undefined,
                password: hashedPassword,
                role: "user",
                status: "Active"
            });
        }

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

module.exports = {
    sendEmailOtp,
    verifyEmailOtp
};
