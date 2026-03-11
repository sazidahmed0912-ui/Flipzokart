const User = require("../models/User");

async function getVerifiedBrands() {
  const count = await User.countDocuments({
    role: 'seller',
    status: 'Active'
  });
  
  return count || 0;
}

module.exports = { getVerifiedBrands };
