const User = require("../models/User");
const Otp = require("../models/Otp"); // Ensure Otp model is imported
const sendEmailService = require("../services/emailService");
const Activity = require("../models/Activity");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/emailService");
const SellerBusiness = require("../models/SellerBusiness");
const SellerStore = require("../models/SellerStore");

// REGISTER
const register = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    email = email.trim().toLowerCase();
    password = password.trim();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "secret_key_123",
      { expiresIn: "30d" }
    );

    // Broadcast log
    const broadcastLog = req.app.get("broadcastLog");
    if (broadcastLog) {
      broadcastLog("success", `New user registered: ${email}`, "Auth");
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const user = await User.findOne({ email: trimmedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret_key_123",
      { expiresIn: "30d" }
    );

    // Log Activity
    await Activity.create({
      user: user._id,
      type: 'login',
      message: 'Logged in to account',
      device: req.headers['user-agent'] || 'Unknown Device',
      ip: req.ip || '0.0.0.0'
    });

    // Broadcast log
    const broadcastLog = req.app.get("broadcastLog");
    if (broadcastLog) {
      broadcastLog("success", `User ${user.email} logged in`, "Auth");
    }

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
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    // For JWT, we can't really invalidate the token server-side without a blocklist
    // But we can return success so frontend can clear it
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();
    console.log('✅ Token saved to database for user:', email);
    console.log('User ID:', user._id);
    console.log('Reset Token:', resetToken);
    console.log('Reset Expiry:', new Date(resetTokenExpiry));

    // Send password reset email (non-blocking)
    sendPasswordResetEmail(email, resetToken).catch(error => {
      console.log('Email sending failed:', error.message);
    });

    // Always return success for testing
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      resetToken: resetToken, // Include token for testing
      resetLink: `http://localhost:3000/#/reset-password?token=${resetToken}` // Direct reset link
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('🔑 Reset password request received:');
    console.log('Token:', token);
    console.log('Password provided:', password ? 'Yes' : 'No');

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    console.log('🔍 Looking for user with token...');
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// --- SELLER ONBOARDING STEPS ---

// STEP 1: REGISTER SELLER ACCOUNT
const registerSeller = async (req, res) => {
  try {
    let { name, email, phone, password, address } = req.body;

    email = email.trim().toLowerCase();
    password = password.trim();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with draft status
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'pending_seller',
      status: 'draft',
      addresses: [{
        address: address,
        type: 'Work'
      }]
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "secret_key_123",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      message: "Seller account created",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status
      },
      nextStep: 2
    });
  } catch (error) {
    console.error("Seller Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// STEP 2: BUSINESS VERIFICATION
const registerBusiness = async (req, res) => {
  try {
    const { gstin, pan } = req.body;
    const sellerId = req.user._id;

    if (!gstin || !pan) {
      return res.status(400).json({ message: "GSTIN and PAN are required" });
    }

    const business = await SellerBusiness.findOneAndUpdate(
      { sellerId },
      { gstin, pan, verificationStatus: 'pending' },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Business details saved",
      business,
      nextStep: 3
    });
  } catch (error) {
    console.error("Business Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// STEP 3: STORE SETUP
const registerStore = async (req, res) => {
  try {
    const { storeName, category } = req.body;
    const sellerId = req.user._id;

    if (!storeName || !category) {
      return res.status(400).json({ message: "Store Name and Category are required" });
    }

    const storeExists = await SellerStore.findOne({ storeName });
    if (storeExists && storeExists.sellerId.toString() !== sellerId.toString()) {
      return res.status(400).json({ message: "Store Name is already taken" });
    }

    const store = await SellerStore.findOneAndUpdate(
      { sellerId },
      { storeName, category, isActive: true },
      { new: true, upsert: true }
    );

    const user = await User.findByIdAndUpdate(sellerId, {
      role: 'seller',
      status: 'Active'
    }, { new: true });

    res.status(200).json({
      success: true,
      message: "Store setup complete",
      store,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Store Setup error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Store Name already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// MOBILE LOGIN
const mobileLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    // 🟢 STRICT LOGIN: If user doesn't exist, FAIL (Don't create)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please Sign Up first."
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret_key_123",
      { expiresIn: "30d" }
    );

    // Broadcast log
    const broadcastLog = req.app.get("broadcastLog");
    if (broadcastLog) {
      broadcastLog("success", `Mobile User ${phone} logged in (Strict Mode)`, "Auth");
    }

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
      },
    });

  } catch (error) {
    console.error("Mobile login error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  registerSeller,
  registerBusiness,
  registerStore,
  mobileLogin
};