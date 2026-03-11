const Review = require("../models/Review");

async function getSatisfactionRate() {
  const result = await Review.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" }
      }
    }
  ]);
  
  if (result.length > 0 && result[0].avgRating) {
    // Convert to percentage (assuming 5 is 100%) or just return the rating?
    // The user's prompt shows satisfaction rate like 99.9%, so let's calculate %
    const percentage = (result[0].avgRating / 5) * 100;
    return percentage.toFixed(1);
  }
  
  return "0";
}

module.exports = { getSatisfactionRate };
