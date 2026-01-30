/**
 * Centralized Pricing Calculator for Flipzokart Context
 * mirrors logic in frontend-next/app/utils/priceHelper.ts
 */

const calculateOrderTotals = (products, paymentMethod) => {
    // 1. Calculate Items Price (Sum of Selling Prices * Quantity)
    const itemsPrice = products.reduce((acc, item) => {
        // item must have 'price' and 'quantity' from DB/Snapshot
        return acc + (item.price * item.quantity);
    }, 0);

    // 2. Calculate Original Price (MRP) - Optional for total, but good for saving
    const mrp = products.reduce((acc, item) => {
        return acc + ((item.originalPrice || item.price) * item.quantity);
    }, 0);

    const discount = mrp > itemsPrice ? mrp - itemsPrice : 0;

    // 3. Delivery Logic
    // Rule: Cart >= 499 -> FREE
    // Rule: Cart < 499 -> Prepaid = Free, COD = 50
    let deliveryCharges = 0;

    if (itemsPrice >= 499) {
        deliveryCharges = 0;
    } else {
        if (paymentMethod === 'COD') {
            deliveryCharges = 50;
        } else {
            deliveryCharges = 0; // Prepaid/Online is free even < 499
        }
    }

    const platformFee = 3;
    const tax = 0;

    // 4. Final Total
    const totalAmount = itemsPrice + deliveryCharges + platformFee + tax;

    return {
        itemsPrice,
        mrp,
        discount,
        deliveryCharges,
        platformFee,
        tax,
        totalAmount,
        finalAmount: totalAmount
    };
};

module.exports = { calculateOrderTotals };
