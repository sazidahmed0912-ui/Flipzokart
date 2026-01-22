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
    // New Fields for Enhanced Product Details
    variants: [
      {
        name: String,
        options: [String]
      }
    ],
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


module.exports = mongoose.model("Product", productSchema);