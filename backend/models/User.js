const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller", "pending_seller"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["Active", "Suspended", "Banned"],
      default: "Active",
    },
    suspensionEnd: Date,
    banReason: String,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        selectedVariants: {
          type: Map,
          of: String,
        },
      },
    ],
    addresses: [
      {
        fullName: String,
        phone: String,
        email: String,
        address: String,
        locality: String,
        city: String,
        state: String,
        pincode: String,
        type: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
      }
    ],
    // Real-Time Location Fields
    lastIp: String,
    latitude: Number,
    longitude: Number,
    locationCity: String,
    locationCountry: String,
    locationUpdatedAt: Date
  },
  { timestamps: true }
);

// COMPARE PASSWORD
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);