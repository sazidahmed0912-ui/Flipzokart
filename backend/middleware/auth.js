
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    // Strict Punishment Check
    if (req.user && req.user.role !== 'admin') {
      // Allow users to check their status (for Banned Page) and submit appeals
      const allowedPaths = ['/api/users/profile', '/api/users/appeal', '/api/users/me'];
      const isAllowed = allowedPaths.includes(req.originalUrl) || req.method === 'GET' && req.originalUrl.includes('/api/users/profile');

      if (!isAllowed) {
        if (req.user.status === 'Banned') {
          return res.status(403).json({ message: `Access Denied: Your account has been permanently banned. Reason: ${req.user.banReason || 'Violation of Terms'}` });
        }
        if (req.user.status === 'Suspended') {
          if (req.user.suspensionEnd && new Date() < new Date(req.user.suspensionEnd)) {
            return res.status(403).json({ message: `Access Denied: Your account is suspended until ${new Date(req.user.suspensionEnd).toLocaleDateString()}.` });
          } else {
            // Auto-reactivate
            req.user.status = 'Active';
            req.user.suspensionEnd = undefined;
            req.user.banReason = undefined;
            await req.user.save();
          }
        }
      }
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
      res.status(401).json({ message: 'Not authorized, token failed' });
    } else {
      console.error("Auth middleware error:", error);
      res.status(500).json({ message: 'Server error during authentication' });
    }
  }
};

module.exports = { protect };
