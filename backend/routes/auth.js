const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");

const { register, login, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
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