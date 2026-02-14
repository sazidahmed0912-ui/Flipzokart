const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      validate: [
        {
          validator: (val) => val.length <= 5,
          message: 'Maximum 5 images allowed'
        }
      ]
    },
    video: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

reviewSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Review", reviewSchema);