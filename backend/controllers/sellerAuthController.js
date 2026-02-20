const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmailService = require("../services/emailService");
const jwt = require("jsonwebtoken");

// SEND OTP FOR SELLER LOGIN
const sendSellerOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Check if user exists and is a seller
        const seller = await User.findOne({ email, role: { $in: ['seller', 'pending_seller'] } });
        if (!seller) {
            return res.status(404).json({ success: false, message: "No seller account found with this email. Please register first." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Clear old OTPs
        await Otp.findOneAndDelete({ email });

        // Save new OTP
        await Otp.create({
            email,
            otp,
        });

        // Email Details
        const emailSubject = 'Your Seller Panel OTP for Fzokart';
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background:#2874F0;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
                    <h2 style="margin:0;">Fzokart Seller Panel</h2>
                </div>
                <div style="padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
                    <p>Hello <strong>${seller.name}</strong>,</p>
                    <p>Your One-Time Password (OTP) for Seller Panel login is:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a; margin: 20px 0;">
                    ${otp}
                    </div>
                    <p style="font-size: 14px; color: #666;">This OTP is valid for 5 minutes. Please do not share this with anyone.</p>
                </div>
            </div>
        `;

        // Send Email (Non-blocking)
        sendEmailService.sendEmail(email, emailSubject, emailHtml).catch(err => {
            console.error("Background Email Error:", err.message);
        });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your seller email"
        });

    } catch (error) {
        console.error("Seller Send OTP Error:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
    }
};

// VERIFY OTP FOR SELLER LOGIN
const verifySellerOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const validOtp = await Otp.findOne({ email, otp });

        if (!validOtp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // OTP Verified. Delete it.
        await Otp.deleteOne({ _id: validOtp._id });

        // Find Seller
        const seller = await User.findOne({ email });

        if (!seller) {
            return res.status(404).json({ success: false, message: "Seller account not found" });
        }

        // Generate SELLER-SPECIFIC Token (Ultra-Lock)
        const sellerToken = jwt.sign(
            { id: seller._id, role: seller.role, type: 'seller_panel' },
            process.env.JWT_SELLER_SECRET,
            { expiresIn: "30d" }
        );

        res.status(200).json({
            success: true,
            message: "Seller login successful",
            seller_token: sellerToken,
            seller: {
                id: seller._id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                role: seller.role,
                status: seller.status
            },
        });

    } catch (error) {
        console.error("Seller Verify OTP Error:", error);
        res.status(500).json({ success: false, message: "Verification failed", error: error.message });
    }
};

module.exports = {
    sendSellerOtp,
    verifySellerOtp
};
