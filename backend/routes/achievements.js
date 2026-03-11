const express = require("express");
const router = express.Router();
const { getActiveUsers } = require("../services/analyticsService");
const { getDailyShipments } = require("../services/ordersService");
const { getVerifiedBrands } = require("../services/vendorsService");
const { getSatisfactionRate } = require("../services/reviewsService");

router.get("/achievements", async (req, res) => {
  try {
    const [activeUsers, dailyShipments, verifiedBrands, satisfactionRate] =
      await Promise.all([
        getActiveUsers(),
        getDailyShipments(),
        getVerifiedBrands(),
        getSatisfactionRate(),
      ]);

    res.json({
      activeUsers: parseInt(activeUsers, 10) || 0,
      dailyShipments: parseInt(dailyShipments, 10) || 0,
      verifiedBrands: parseInt(verifiedBrands, 10) || 0,
      satisfactionRate: parseFloat(satisfactionRate) || 0,
    });
  } catch (error) {
    console.error("Achievements API Error:", error);
    res.status(500).json({ error: "Achievements fetch failed" });
  }
});

module.exports = router;
