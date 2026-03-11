const express = require("express");
const router = express.Router();

// Existing service functions (Admin Panel logic)
const { getActiveUsers } = require("../services/analyticsService"); // GA real-time
const { getShippedOrdersCount } = require("../services/ordersService"); // Admin Panel shipped orders
const { getVerifiedSellers } = require("../services/sellersService"); // Admin Panel verified sellers
const { getApprovedReviewsAvg } = require("../services/reviewsService"); // Admin Panel approved reviews

router.get("/achievements", async (req, res) => {
  try {
    const [
      activeUsers,
      dailyShipments,
      verifiedBrands,
      satisfactionRate
    ] = await Promise.all([
      getActiveUsers(),           // Google Analytics
      getShippedOrdersCount(),    // Only orders with status 'shipped'
      getVerifiedSellers(),       // Only sellers with verified flag true
      getApprovedReviewsAvg()     // Only reviews submitted and approved
    ]);

    res.json({
      activeUsers,
      dailyShipments,
      verifiedBrands,
      satisfactionRate
    });
  } catch (error) {
    console.error("Achievements fetch failed:", error);
    res.status(500).json({ error: "Achievements fetch failed" });
  }
});

module.exports = router;
