const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const User = require("../models/User");

const createUser = async () => {
  try {
    // 🔗 Connect DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 🔍 Check existing user
    const email = "user@flipzokart.com";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return;
    }

    // ✅ CREATE USER (PLAIN PASSWORD)
    // ❗ password ko hash MAT karo — model karega
    const user = await User.create({
      name: "Test User",
      email: email,
      phone: "9876543210",
      password: "user123",
      role: "user",
    });

    console.log("🎉 USER CREATED SUCCESSFULLY");
    console.log("📧 Email:", user.email);
    console.log("🔑 Password: user123");
    console.log("👤 Role:", user.role);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

createUser();