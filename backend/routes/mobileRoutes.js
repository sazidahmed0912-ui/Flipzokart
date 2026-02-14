const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../controllers/mobileAuthController");

const rateLimit = require("express-rate-limit");

// 🛡️ Rate Limiter: Prevent SMS Flooding
const sendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP requests per window
    message: { success: false, message: "Too many OTP requests. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// 🛡️ Rate Limiter: Brute Force Protection
const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 verification attempts per window
    message: { success: false, message: "Too many verification attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/send-otp", sendOtpLimiter, sendOtp);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);

module.exports = router;
