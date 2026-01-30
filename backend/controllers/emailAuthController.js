const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmailService = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// SEND EMAIL OTP
const sendEmailOtp = async (req, res) => {
    try {
        const { email, type } = req.body; // 'login' or 'seller_register'

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
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
            emailSubject = 'Verify Your Seller Account – OTP Confirmation | Fzokart';
            emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #2874F0;">Verify Your Seller Account – OTP Confirmation | Fzokart</h2>
                <p>Hello <strong>Seller</strong>,</p>
                <p>Thank you for registering as a seller on Fzokart.</p>
                <p>To complete your seller account registration, please verify your email address using the One-Time Password (OTP) below:</p>
                
                <h3 style="color: #555;">🔐 Your OTP Code:</h3>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2874F0; margin: 20px 0;">
                ${otp}
                </div>
                
                <p>This OTP is valid for <strong>5 minutes only</strong>.</p>
                <p>For security reasons, please do not share this OTP with anyone.</p>
                <p>If you did not request this verification, please ignore this email.</p>
                <p>Once verified, you can start listing products and selling on Fzokart.</p>
                
                <br/>
                <p>Best regards,</p>
                <p><strong>Team Fzokart</strong><br/>Empowering sellers to grow online</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
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
