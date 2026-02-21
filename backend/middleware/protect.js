const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 🔍 Token check (Authorization: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // ❌ Token missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_USER_SECRET || process.env.JWT_SECRET || "secret_key_123"
    );

    // ✅ Get user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Attach user to request
    req.user = user;

    next(); // 🚀 allow request
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: "Token invalid",
      });
    }
    console.error("Protect middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

module.exports = protect;