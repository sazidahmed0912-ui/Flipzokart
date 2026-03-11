const Order = require("../models/Order");

async function getDailyShipments() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return await Order.countDocuments({
    status: 'Shipped',
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
}

module.exports = { getDailyShipments };
