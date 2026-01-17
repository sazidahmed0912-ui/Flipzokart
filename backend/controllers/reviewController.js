const Review = require("../models/Review");
const Product = require("../models/Product"); // Assuming Product model exists
const User = require("../models/User"); // Assuming User model exists

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { product, rating, comment } = req.body;
  const user = req.user._id; // Comes from protect middleware

  try {
    // Check if product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user has already reviewed this product
    const alreadyReviewed = await Review.findOne({ user, product });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      user,
      product,
      rating,
      comment,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name");

    // Emit real-time event
    const io = req.app.get("socketio");
    io.emit("newReview", populatedReview);

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email") // Populate user details
      .sort({ createdAt: -1 }); // Latest reviews first

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:reviewId
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId).populate(
      "user",
      "name email"
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    let review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Make sure user is the review owner
    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this review" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    review = await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name");

    // Emit real-time event
    const io = req.app.get("socketio");
    io.emit("updatedReview", populatedReview);

    res.status(200).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Make sure user is the review owner OR admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, message: "Review removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all reviews by a user
// @route   GET /api/reviews/user/:userId
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate("product", "name image") // Populate product name and image
      .sort({ createdAt: -1 }); // Latest reviews first

    if (!reviews) {
      return res.status(404).json({ message: "No reviews found for this user" });
    }

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
};