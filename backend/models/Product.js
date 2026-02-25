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
      index: true
    },
    subcategory: {
      type: String,
      index: true
    },
    submenu: {
      type: String,
      index: true
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
        id: String,              // Admin matrix ID
        combination: String,     // e.g. "Black/S"
        options: { type: Map, of: String },  // e.g. { Color: "Black", Size: "S" }
        stock: Number,
        price: Number,
        sku: String,
        image: String,
        isDefault: Boolean,      // Is this the default variant
        variantIds: [String]     // Array of variant option IDs
      }
    ],
    images: [String],
    originalPrice: Number,
    sku: String,
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    defaultColor: { type: String, default: "" },
    codAvailable: { type: Boolean, default: true },
    prepaidAvailable: { type: Boolean, default: true },
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
    // 📊 TRENDING RANKING FIELDS
    totalOrders: {
      type: Number,
      default: 0,
      index: true  // Index for fast sort by popularity
    },
    genderCategory: {
      type: String,
      enum: ["Men", "Women", "Kids", null],
      default: null,
      index: true  // Index for fast gender-based filtering
    },
    // 🧾 GST ENGINE FIELDS
    // null = inherit gstRate from category. Set a number to override.
    customGstRate: {
      type: Number,
      enum: [null, 0, 5, 12, 18, 28],
      default: null
    },
    // 'exclusive' = price is base price, GST is ADDED on top.
    // 'inclusive' = price already includes GST, GST must be extracted.
    priceType: {
      type: String,
      enum: ['inclusive', 'exclusive'],
      default: 'exclusive'
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