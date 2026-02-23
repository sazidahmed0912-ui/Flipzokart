const mongoose = require('mongoose');

// Simple and safe coupon model (STEP 1)
// Keeping the schema minimal for stability and easy reasoning.
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  // 'percentage' or 'flat' - lowercase for consistency with the frontend logic
  type: { type: String, enum: ["percentage", "flat"], required: true },
  // value corresponding to the type (percentage value or flat amount)
  value: { type: Number, required: true },
  // minimum cart total required to apply coupon
  minAmount: { type: Number, default: 0 },
  // maximum discount cap (0 means no cap)
  maxDiscount: { type: Number, default: 0 },
  // expiry date (optional)
  expiry: { type: Date },
  // is coupon currently active
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
