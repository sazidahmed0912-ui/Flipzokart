/**
 * 🏗️ FINAL MASTER PRICE ENGINE — Fzokart
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ULTRA LOCK: Calculation allowed ONLY in:
 *   POST /api/order/preview
 *   POST /api/order/create
 *
 * NEVER called from:
 *   ❌ Order Success Page
 *   ❌ Invoice Page
 *   ❌ My Orders / View Details
 *   ❌ Admin Panel
 *
 * Each order uses this engine ONCE. Values are frozen in DB forever.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const round = (num) => Math.round(Number(num) * 100) / 100;

/**
 * Core item processor.
 * @param {object} item - { mrp, sellingPrice, quantity, gstRate, priceType, _id, name, image, ... }
 */
const processItem = (item) => {
    const mrp = Number(item.mrp || item.originalPrice || item.sellingPrice || 0);
    const sellingPrice = Number(item.sellingPrice || item.price || 0);
    const quantity = Number(item.quantity) || 1;
    const gstRate = Number(item.gstRate ?? item.customGstRate ?? 18);
    const priceType = item.priceType || 'exclusive';

    const itemSubtotalBeforeGST = sellingPrice * quantity;

    let gstAmount = 0;
    let baseAmount = itemSubtotalBeforeGST;

    if (priceType === 'exclusive') {
        // Price is base → GST added on top
        gstAmount = round((itemSubtotalBeforeGST * gstRate) / 100);
        baseAmount = round(itemSubtotalBeforeGST);
    } else {
        // Price already includes GST → extract it
        const baseWithoutGST = itemSubtotalBeforeGST / (1 + gstRate / 100);
        gstAmount = round(itemSubtotalBeforeGST - baseWithoutGST);
        baseAmount = round(baseWithoutGST);
    }

    return {
        productId: item._id || item.productId,
        name: item.name || '',
        image: item.image || item.thumbnail || (item.images && item.images[0]) || '',
        mrp,
        sellingPrice,
        quantity,
        gstRate,
        priceType,
        itemSubtotal: baseAmount,          // base amount (pre-GST)
        itemGST: gstAmount,           // GST portion for this line
        itemFinal: round(baseAmount + gstAmount)  // customer pays this
    };
};

/**
 * 🔒 CALCULATE FINAL ORDER — One calculation, then freeze.
 *
 * @param {object} params
 * @param {Array}  params.items           - DB products with qty, gstRate, priceType
 * @param {number} params.deliveryCharge  - calculated server-side
 * @param {number} params.platformFee     - fixed platform fee
 * @param {number} params.couponDiscount  - validated coupon discount
 * @returns {object} Full frozen order summary
 */
const calculateFinalOrder = ({
    items = [],
    deliveryCharge = 0,
    platformFee = 3,
    couponDiscount = 0
}) => {
    let subtotal = 0;
    let totalGST = 0;
    let cgst = 0;
    let sgst = 0;
    let mrpTotal = 0;

    const processedItems = items.map(item => {
        const processed = processItem(item);

        subtotal += processed.itemSubtotal;
        totalGST += processed.itemGST;
        cgst += round(processed.itemGST / 2);
        sgst += round(processed.itemGST / 2);
        mrpTotal += round(processed.mrp * processed.quantity);

        return processed;
    });

    subtotal = round(subtotal);
    totalGST = round(totalGST);
    cgst = round(cgst);
    sgst = round(sgst);
    mrpTotal = round(mrpTotal);
    deliveryCharge = round(Number(deliveryCharge) || 0);
    platformFee = round(Number(platformFee) || 0);
    couponDiscount = round(Number(couponDiscount) || 0);

    const grandTotal = round(
        subtotal + totalGST + deliveryCharge + platformFee - couponDiscount
    );

    return {
        items: processedItems,
        // Order-level frozen summary
        subtotal,       // Sum of base prices (pre-GST)
        totalGST,       // Total GST
        cgst,           // CGST (half of totalGST)
        sgst,           // SGST (half of totalGST)
        mrp: mrpTotal,
        deliveryCharge,
        platformFee,
        couponDiscount,
        grandTotal      // ← the final amount payable
    };
};

/**
 * Delivery charge calculator.
 * Cart >= ₹499 (items + GST) → FREE. COD < ₹499 → ₹50.
 * @param {number} itemsPlusGST
 * @param {string} paymentMethod 'COD' | 'RAZORPAY'
 */
const calculateDeliveryCharge = (itemsPlusGST, paymentMethod = 'COD') => {
    if (itemsPlusGST >= 499) return 0;
    return paymentMethod === 'COD' ? 50 : 0;
};

module.exports = { calculateFinalOrder, calculateDeliveryCharge, round, processItem };
