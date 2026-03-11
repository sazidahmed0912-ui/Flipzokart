const Review = require("../models/Review");

async function getSatisfactionRate() {
  const result = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
  ]);
  return result.length > 0 ? (result[0].avgRating * 20).toFixed(1) : 0; // Convert 1-5 to percentage
}

module.exports = { getSatisfactionRate };
