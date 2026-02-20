const express = require("express");
const router = express.Router();

const {
    sendSellerOtp,
    verifySellerOtp
} = require("../controllers/sellerAuthController");

// POST /api/seller/auth/send-otp
router.post("/send-otp", sendSellerOtp);

// POST /api/seller/auth/verify-otp
router.post("/verify-otp", verifySellerOtp);

module.exports = router;
