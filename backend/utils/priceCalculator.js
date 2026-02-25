/**
 * Centralized Pricing Calculator for Flipzokart Context
 * mirrors logic in frontend-next/app/utils/priceHelper.ts
 *
 * GST Support: Items can carry `customGstRate` and `priceType` (inclusive/exclusive).
 * Uses gstUtils.js for the GST engine.
 */

const { calculateCartGST } = require('./gstUtils');

const calculateOrderTotals = (products, paymentMethod) => {
    // 1. GST Engine — aggregate GST across all products
    // Each item in products should have: price, quantity, priceType?, customGstRate?, categoryGstRate?
    const gstResult = calculateCartGST(products);

    // 2. Items Price = sum of BASE prices (pre-GST for exclusive, extracted base for inclusive)
    const itemsPrice = gstResult.subtotal;

    // 3. Original Price (MRP) for discount display
    const mrp = products.reduce((acc, item) => {
        return acc + ((item.mrp || item.originalPrice || item.price) * (item.quantity || 1));
    }, 0);

    const discount = mrp > itemsPrice ? parseFloat((mrp - itemsPrice).toFixed(2)) : 0;

    // 4. Delivery Logic
    // Rule: Cart >= 499 (based on items+GST) → FREE
    // Rule: Cart <  499 → Prepaid = Free, COD = ₹50
    const itemsPlusGST = gstResult.grandTotal;
    let deliveryCharges = 0;

    if (itemsPlusGST >= 499) {
        deliveryCharges = 0;
    } else {
        deliveryCharges = (paymentMethod === 'COD') ? 50 : 0;
    }

    const platformFee = 3;

    // 5. Final Total = itemsBase + GST + delivery + platformFee
    const totalAmount = parseFloat((itemsPrice + gstResult.totalGST + deliveryCharges + platformFee).toFixed(2));

    return {
        itemsPrice,
        mrp,
        discount,
        deliveryCharges,
        platformFee,
        // 🧾 GST Breakdown
        cgst: gstResult.totalCGST,
        sgst: gstResult.totalSGST,
        tax: gstResult.totalGST,   // Backward compat alias (totalGST)
        totalGST: gstResult.totalGST,
        totalAmount,
        finalAmount: totalAmount
    };
};

module.exports = { calculateOrderTotals };

