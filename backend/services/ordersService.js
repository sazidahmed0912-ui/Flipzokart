const Order = require("../models/Order");

async function getDailyShipments() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const count = await Order.countDocuments({
    status: 'Shipped',
    updatedAt: { $gte: startOfToday }
  });
  
  return count || 0;
}

module.exports = { getDailyShipments };
