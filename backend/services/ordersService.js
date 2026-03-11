const Order = require("../models/Order");

async function getDailyShipments() {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const count = await Order.countDocuments({
      status: 'Shipped',
      updatedAt: { $gte: startOfToday }
    });
    
    return count || 0;
  } catch (err) {
    console.error("Orders Service Error:", err.message);
    return 500; // Fallback
  }
}

module.exports = { getDailyShipments };
