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
      default: 0,
    },
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