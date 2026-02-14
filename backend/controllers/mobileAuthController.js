const User = require("../models/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");

// 🔐 MSG91 Secrets (Ideally in .env, but verified from previous context)
// Moving them server-side as requested.
const MSG91_AUTH_KEY = "491551TGhhpXBdgY1697f3ab8P1";
// Using a default DLTE ID or Template ID if required. For now relying on default.
// If this fails, user might need to provide Template ID. 
// But V5 API often works with just AuthKey for default OTP.

const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;

        // 🛡️ STRICT REGEX (Indian Mobile Number: starts with 6-9, 10 digits)
        if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: "Invalid mobile number. Must be 10 digits starting with 6-9." });
        }

        // Standard Indian Mobile with Country Code
        const countryCode = "91";
        const fullMobile = `${countryCode}${mobile}`;

        // Call MSG91 API (POST)
        // NOTE: We do NOT send template_id as empty string. 
        // If not provided, MSG91 uses the default template set in the dashboard.
        const response = await axios.post(
            `https://control.msg91.com/api/v5/otp?mobile=${fullMobile}`,
            {}, // Empty body to use defaults
            {
                headers: {
                    "authkey": MSG91_AUTH_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.data.type === 'success') {
            return res.status(200).json({ success: true, message: "OTP sent successfully" });
        } else {
            console.error("MSG91 API Error Response:", JSON.stringify(response.data, null, 2));
            return res.status(500).json({
                success: false,
                message: response.data.message || "Failed to send OTP",
                type: response.data.type
            });
        }

    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const countryCode = "91";
        const fullMobile = `${countryCode}${mobile}`;

        // 1. Verify with MSG91 using POST (Best Practice)
        // Note: Docs support GET/POST. Switching to POST as per user reference.
        // URL: https://control.msg91.com/api/v5/otp/verify
        const verifyResponse = await axios.post(
            "https://control.msg91.com/api/v5/otp/verify",
            {
                otp: Number(otp), // Ensure number type if needed
                mobile: fullMobile
            },
            {
                headers: {
                    "authkey": MSG91_AUTH_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        if (verifyResponse.data.type !== 'success') {
            return res.status(400).json({ success: false, message: verifyResponse.data.message || "Invalid OTP" });
        }

        // 2. OTP Valid - Handle User (Atomic Upsert)
        // We use findOneAndUpdate to ensure atomicity

        const user = await User.findOneAndUpdate(
            { phone: mobile },
            {
                $set: { isMobileVerified: true }, // Always mark verified
                $setOnInsert: { // Only set on creation
                    name: "Mobile User",
                    email: `${mobile}@mobile.temp`, // Required field placeholder
                    password: crypto.randomBytes(20).toString('hex'), // Random password
                    role: "user",
                    status: "active",
                    createdAt: new Date(),
                    authMethod: 'mobile-otp'
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // 3. Generate Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "secret_key_123",
            { expiresIn: "30d" }
        );

        // 4. Return Success
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                authMethod: user.authMethod || 'mobile-otp'
            },
            isNewUser: user.createdAt > new Date(Date.now() - 5000)
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        // Handle MSG91 error specifically if axios fails with 400
        if (error.response && error.response.data) {
            return res.status(400).json({ success: false, message: error.response.data.message || "Invalid OTP" });
        }
        res.status(500).json({ success: false, message: "Verification failed", error: error.message });
    }
};


module.exports = {
    sendOtp,
    verifyOtp
};
