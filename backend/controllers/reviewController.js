const Review = require("../models/Review");
const Product = require("../models/Product"); // Assuming Product model exists
const User = require("../models/User"); // Assuming User model exists

// Helper to calculate average rating
const calculateProductStats = async (productId, io) => {
  const reviews = await Review.find({ product: productId });
  const reviewsCount = reviews.length;
  const rating = reviewsCount === 0
    ? 0
    : reviews.reduce((acc, item) => item.rating + acc, 0) / reviewsCount;

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      rating,
      reviewsCount
    },
    { new: true }
  );

  // Real-time update for product details page
  if (io) {
    io.emit('productUpdated', product);
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { product, rating, comment, images, video } = req.body;
  const user = req.user._id;

  try {
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = await Review.findOne({ user, product });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      user,
      product,
      rating: Number(rating),
      comment,
      images: images || [],
      video: video || null
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name");

    const io = req.app.get("socketio");
    io.emit("newReview", populatedReview);

    // Update Product Stats
    await calculateProductStats(product, io);

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
      .populate("user", "name email")
      .sort({ createdAt: -1 });

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

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this review" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    review = await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name");

    const io = req.app.get("socketio");
    io.emit("updatedReview", populatedReview);

    // Update Product Stats
    await calculateProductStats(review.product, io);

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

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "Not authorized to delete this review" });
    }

    const productId = review.product; // Save before delete
    await review.deleteOne();

    // Update Product Stats
    const io = req.app.get("socketio");
    await calculateProductStats(productId, io);

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
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    if (!reviews) {
      return res.status(404).json({ message: "No reviews found for this user" });
    }

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("user", "name email")
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Toggle Like on a review
// @route   PUT /api/reviews/:reviewId/like
// @access  Private
const toggleLikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user._id.toString();

    // Check if user already liked
    const hasLiked = review.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      review.likes = review.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like (and remove dislike if exists)
      review.likes.push(userId);
      review.dislikes = review.dislikes.filter((id) => id.toString() !== userId);
    }

    await review.save();

    const populatedReview = await Review.findById(review._id).populate("user", "name email");

    const io = req.app.get("socketio");
    if (io) io.emit("updatedReview", populatedReview);

    res.status(200).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Toggle Dislike on a review
// @route   PUT /api/reviews/:reviewId/dislike
// @access  Private
const toggleDislikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user._id.toString();

    // Check if user already disliked
    const hasDisliked = review.dislikes.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      review.dislikes = review.dislikes.filter((id) => id.toString() !== userId);
    } else {
      // Dislike (and remove like if exists)
      review.dislikes.push(userId);
      review.likes = review.likes.filter((id) => id.toString() !== userId);
    }

    await review.save();

    const populatedReview = await Review.findById(review._id).populate("user", "name email");

    const io = req.app.get("socketio");
    if (io) io.emit("updatedReview", populatedReview);

    res.status(200).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Add a comment to a review
// @route   POST /api/reviews/:reviewId/comment
// @access  Private
const addCommentToReview = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: "Comment is required" });

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const newComment = {
      user: req.user._id,
      comment
    };

    review.comments.push(newComment);
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("comments.user", "name");

    const io = req.app.get("socketio");
    if (io) io.emit("updatedReview", populatedReview);

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get latest reviews (Public — for homepage)
// @route   GET /api/reviews/latest?limit=6
// @access  Public
const getLatestReviews = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const reviews = await Review.find({ comment: { $exists: true, $ne: '' } })
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews,
  getAllReviews,
  getLatestReviews,
  toggleLikeReview,
  toggleDislikeReview,
  addCommentToReview
};