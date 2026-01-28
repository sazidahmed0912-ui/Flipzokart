const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmailService = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// SEND EMAIL OTP
const sendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;

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

        // Send Email
        await sendEmailService.sendEmailOtp(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email"
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
