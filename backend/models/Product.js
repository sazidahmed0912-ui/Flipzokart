const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    image: {
      type: String,
    },
    countInStock: {
      type: Number,
      default: 100,
    },
    specifications: {
      type: String,
    },
    // New Fields for Enhanced Product Details
    // Updated for Flat Variant Architecture
    variants: [
      {
        color: String,
        size: String,
        name: String,
        price: Number,
        stock: Number,
        image: String,
        sku: String,
        productId: String
      }
    ],
    // Maintain inventory if needed for legacy/backup, though variants is strict source now
    inventory: [
      {
        options: { type: Map, of: String },
        stock: Number,
        price: Number,
        sku: String,
        image: String
      }
    ],
    images: [String],
    originalPrice: Number,
    sku: String,
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    defaultColor: { type: String, default: "" },
    // 🔒 SYSTEM INTEGRITY FIELDS
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      default: "approved",
      enum: ["approved", "pending", "rejected"]
    },
    published: {
      type: Boolean,
      default: true
    },
    // Payment Restrictions
    codAvailable: {
      type: Boolean,
      default: true
    },
    prepaidAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// 🛠️ VIRTUAL: mainImage
// Ensures a consistent image is always returned for Admin/Frontend
productSchema.virtual("mainImage").get(function () {
  if (this.image) return this.image;
  if (this.images && this.images.length > 0) return this.images[0];
  return "";
});


module.exports = mongoose.model("Product", productSchema);