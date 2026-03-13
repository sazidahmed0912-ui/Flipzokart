const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { authorize } = require("../middleware/authorize"); // Assuming authorize middleware is in authorize.js
const {
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
  addCommentToReview,
  updateReviewStatus
} = require("../controllers/reviewController");

// Admin routes
router.get("/admin/all", protect, authorize(['admin']), getAllReviews);
router.patch("/:reviewId/status", protect, authorize(['admin']), updateReviewStatus);

// Public routes
router.get("/latest", getLatestReviews);           // Homepage real reviews
router.get("/products/:productId/reviews", getProductReviews);
router.get("/:reviewId", getReviewById);

// Protected routes (user must be logged in)
router.post("/", protect, createReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.get("/user/:userId", protect, getUserReviews); // New route to get reviews by user ID

// Review Actions
router.put("/:reviewId/like", protect, toggleLikeReview);
router.put("/:reviewId/dislike", protect, toggleDislikeReview);
router.post("/:reviewId/comment", protect, addCommentToReview);

module.exports = router;