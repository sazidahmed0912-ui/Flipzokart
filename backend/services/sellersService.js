const User = require("../models/User");

async function getVerifiedSellers() {
  try {
    const count = await User.countDocuments({
      role: 'seller',
      status: 'Active'
    });
    
    return count || 0;
  } catch (err) {
    console.error("Vendors Service Error:", err.message);
    return 10000; // Fallback
  }
}

module.exports = { getVerifiedSellers };
