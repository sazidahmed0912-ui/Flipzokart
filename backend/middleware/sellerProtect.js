const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sellerProtect = async (req, res, next) => {
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
            message: "Not authorized to access Seller Panel, token missing",
        });
    }

    try {
        // ✅ Verify using SELLER secret
        const decoded = jwt.verify(
            token,
            process.env.JWT_SELLER_SECRET || "fzokartSellerUltraLock2024$#@!"
        );

        // ✅ Get user from DB
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Seller account not found",
            });
        }

        // ✅ Attach user to request (using req.user for compatibility with existing business/store routes)
        req.user = user;

        next(); // 🚀 allow request
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Seller token invalid or expired",
        });
    }
};

module.exports = sellerProtect;
