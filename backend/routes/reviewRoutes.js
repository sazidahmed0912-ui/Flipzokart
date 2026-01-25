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
  getUserReviews, // Import the new controller function
  getAllReviews
} = require("../controllers/reviewController");

// Admin routes
router.get("/admin/all", protect, authorize(['admin']), getAllReviews);

// Public routes
router.get("/products/:productId/reviews", getProductReviews);
router.get("/:reviewId", getReviewById);

// Protected routes (user must be logged in)
router.post("/", protect, createReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.get("/user/:userId", protect, getUserReviews); // New route to get reviews by user ID

module.exports = router;