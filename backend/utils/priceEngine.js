/**
 * 🏗️ MASTER PRICE ENGINE — Fzokart
 * ─────────────────────────────────────────────────────────────
 * ULTRA LOCK: This is the ONLY place prices are calculated.
 * Cart → Checkout → Order → Invoice all use this same engine.
 * Frontend NEVER calculates prices — it only displays API responses.
 * ─────────────────────────────────────────────────────────────
 */

const round = (num) => Math.round(Number(num) * 100) / 100;

// GST slabs (India)
const VALID_GST_SLABS = [0, 5, 12, 18, 28];
const DEFAULT_GST_RATE = 18;

/**
 * Resolve effective GST rate for a product.
 * Priority: product.customGstRate → category.gstRate → DEFAULT_GST_RATE
 */
const resolveGstRate = (product, categoryGstRate = null) => {
    if (product.customGstRate !== null && product.customGstRate !== undefined) {
        return Number(product.customGstRate);
    }
    if (categoryGstRate !== null && categoryGstRate !== undefined) {
        return Number(categoryGstRate);
    }
    return DEFAULT_GST_RATE;
};

/**
 * Calculate pricing for ONE item (unit-level then scaled by quantity).
 *
 * @param {object} product   - Full product from DB ({ price, name, customGstRate, priceType, ... })
 * @param {number} quantity
 * @param {number|null} categoryGstRate  - GST rate from product's category
 * @returns {object} item breakdown
 */
const calculateItem = (product, quantity = 1, categoryGstRate = null) => {
    const unitPrice = Number(product.price || 0);
    const gstRate = resolveGstRate(product, categoryGstRate);
    const qty = Number(quantity) || 1;

    let baseAmount, totalGST, finalAmount;

    if (product.priceType === 'inclusive') {
        // Price already includes GST — extract it
        finalAmount = round(unitPrice * qty);
        baseAmount = round(finalAmount / (1 + gstRate / 100));
        totalGST = round(finalAmount - baseAmount);
    } else {
        // Exclusive — add GST on top
        baseAmount = round(unitPrice * qty);
        totalGST = round((baseAmount * gstRate) / 100);
        finalAmount = round(baseAmount + totalGST);
    }

    const cgst = round(totalGST / 2);
    const sgst = round(totalGST / 2);

    return {
        productId: product._id || product.id,
        name: product.name || '',
        image: product.image || product.thumbnail || (product.images && product.images[0]) || '',
        quantity: qty,
        unitPrice,
        priceType: product.priceType || 'exclusive',
        gstRate,
        baseAmount,  // Pre-GST total for this line
        cgst,
        sgst,
        totalGST,
        finalAmount  // What customer pays for this line
    };
};

/**
 * Calculate full cart/order summary.
 *
 * @param {Array}  items          - Array of { product: DBProduct, quantity: number }
 * @param {number} couponDiscount - Validated discount amount (₹)
 * @param {string} paymentMethod  - 'COD' | 'RAZORPAY'
 * @returns {object} Complete price summary
 */
const calculateCartSummary = (items = [], couponDiscount = 0, paymentMethod = 'COD') => {
    let subtotal = 0;   // Sum of base amounts (pre-GST)
    let totalGST = 0;   // Sum of all GST
    let totalCGST = 0;
    let totalSGST = 0;
    let totalMRP = 0;  // Sum of originalPrice * qty

    const calculatedItems = items.map(({ product, quantity }) => {
        const categoryGstRate = product.categoryGstRate !== undefined
            ? product.categoryGstRate
            : null;

        const item = calculateItem(product, quantity, categoryGstRate);

        subtotal += item.baseAmount;
        totalGST += item.totalGST;
        totalCGST += item.cgst;
        totalSGST += item.sgst;

        const mrpUnit = Number(product.originalPrice || product.price || 0);
        totalMRP += round(mrpUnit * quantity);

        return item;
    });

    subtotal = round(subtotal);
    totalGST = round(totalGST);
    totalCGST = round(totalCGST);
    totalSGST = round(totalSGST);
    totalMRP = round(totalMRP);
    couponDiscount = round(Number(couponDiscount) || 0);

    // Subtotal + GST = what items cost (before delivery/coupon)
    const itemsPlusGST = round(subtotal + totalGST);

    // Discount on MRP
    const mrpDiscount = totalMRP > itemsPlusGST ? round(totalMRP - itemsPlusGST) : 0;

    // Delivery Logic:
    // Cart value >= ₹499 → FREE
    // COD, <499 → ₹50
    // Prepaid, <499 → FREE
    let deliveryCharge = 0;
    if (itemsPlusGST >= 499) {
        deliveryCharge = 0;
    } else if (paymentMethod === 'COD') {
        deliveryCharge = 50;
    }

    const platformFee = 3;

    const grandTotal = round(itemsPlusGST - couponDiscount + deliveryCharge + platformFee);

    return {
        items: calculatedItems,
        itemCount: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
        subtotal,       // Items base (pre-GST)
        totalGST,       // Total GST charged
        cgst: totalCGST,
        sgst: totalSGST,
        itemsPlusGST,   // Items + GST
        mrp: totalMRP,
        mrpDiscount,
        couponDiscount,
        deliveryCharge,
        platformFee,
        grandTotal      // Final amount customer pays
    };
};

module.exports = {
    round,
    resolveGstRate,
    calculateItem,
    calculateCartSummary
};
