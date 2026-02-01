const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  registerSeller,
  registerBusiness,
  registerStore,
  mobileLogin
} = require("../controllers/authController");

const {
  sendEmailOtp,
  verifyEmailOtp
} = require("../controllers/emailAuthController");

router.post("/register", register);
router.post("/login", login);
router.post("/mobile-login", mobileLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Email OTP Routes
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

// Test Email Route (Step 14)
router.get("/test-email", async (req, res) => {
  try {
    const { sendEmailOtp } = require("../services/emailService");
    await sendEmailOtp("flipzokartshop@gmail.com", "123456"); // Self-test
    res.send("Test Email Sent to flipzokartshop@gmail.com");
  } catch (error) {
    res.status(500).send("Email Test Failed: " + error.message);
  }
});

// Seller Routes
router.post("/seller/register", registerSeller);
router.post("/seller/business", protect, registerBusiness); // Protect ensures we have a logged-in user (created in step 1)
router.post("/seller/store", protect, registerStore);
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      status: req.user.status,
      suspensionEnd: req.user.suspensionEnd,
      banReason: req.user.banReason,
      createdAt: req.user.createdAt,
      joinedDate: req.user.createdAt // map for frontend
    },
  });
});

module.exports = router;