const SellerBusiness = require("../models/SellerBusiness");

async function getVerifiedBrands() {
  return await SellerBusiness.countDocuments({
    verificationStatus: 'verified'
  });
}

module.exports = { getVerifiedBrands };
