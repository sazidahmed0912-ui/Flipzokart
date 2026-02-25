/**
 * 🧾 GST UTILITY ENGINE — Fzokart
 * India GST Rules:
 *   Total GST → split 50/50 into CGST + SGST (for intra-state)
 *   Slabs: 0%, 5%, 12%, 18%, 28%
 *
 * Two modes:
 *   EXCLUSIVE — product.price is the BASE price; GST is ADDED on top → finalPrice = basePrice + GST
 *   INCLUSIVE — product.price already INCLUDES GST; GST must be extracted → basePrice = price / (1 + gstRate/100)
 */

const VALID_GST_SLABS = [0, 5, 12, 18, 28];
const DEFAULT_GST_RATE = 18;

/**
 * Resolve the effective GST rate for a product.
 * Priority: product.customGstRate (if not null) → categoryGstRate → DEFAULT_GST_RATE (18%)
 * @param {object|null} product - Product document from DB
 * @param {number|null} categoryGstRate - GST rate from the product's category
 * @returns {number} effective GST rate (0/5/12/18/28)
 */
const resolveGstRate = (product, categoryGstRate = null) => {
    if (product && product.customGstRate !== null && product.customGstRate !== undefined) {
        return Number(product.customGstRate);
    }
    if (categoryGstRate !== null && categoryGstRate !== undefined) {
        return Number(categoryGstRate);
    }
    return DEFAULT_GST_RATE;
};

/**
 * Calculate GST for a product in EXCLUSIVE mode.
 * Price is base price; GST is added on top.
 *
 * @param {number} basePrice - Price per unit (excluding GST)
 * @param {number} quantity
 * @param {number} gstRate - e.g. 18 for 18%
 * @returns {{ basePrice, gstRate, cgst, sgst, totalGST, finalPrice }}
 */
const calculateGSTExclusive = (basePrice, quantity = 1, gstRate = DEFAULT_GST_RATE) => {
    const base = parseFloat((basePrice * quantity).toFixed(2));
    const totalGST = parseFloat(((base * gstRate) / 100).toFixed(2));
    const cgst = parseFloat((totalGST / 2).toFixed(2));
    const sgst = parseFloat((totalGST / 2).toFixed(2));
    const finalPrice = parseFloat((base + totalGST).toFixed(2));

    return { basePrice: base, gstRate, cgst, sgst, totalGST, finalPrice };
};

/**
 * Calculate GST for a product in INCLUSIVE mode.
 * Price already includes GST; GST is extracted from price.
 *
 * @param {number} inclusivePrice - Price per unit (including GST)
 * @param {number} quantity
 * @param {number} gstRate - e.g. 18 for 18%
 * @returns {{ basePrice, gstRate, cgst, sgst, totalGST, finalPrice }}
 */
const calculateGSTInclusive = (inclusivePrice, quantity = 1, gstRate = DEFAULT_GST_RATE) => {
    const finalPrice = parseFloat((inclusivePrice * quantity).toFixed(2));
    const basePrice = parseFloat((finalPrice / (1 + gstRate / 100)).toFixed(2));
    const totalGST = parseFloat((finalPrice - basePrice).toFixed(2));
    const cgst = parseFloat((totalGST / 2).toFixed(2));
    const sgst = parseFloat((totalGST / 2).toFixed(2));

    return { basePrice, gstRate, cgst, sgst, totalGST, finalPrice };
};

/**
 * Master GST calculator — picks exclusive or inclusive based on product.priceType.
 *
 * @param {object} product - { price, priceType, customGstRate }
 * @param {number} quantity
 * @param {number|null} categoryGstRate - from product's category document
 * @returns {{ basePrice, gstRate, cgst, sgst, totalGST, finalPrice }}
 */
const calculateProductGST = (product, quantity = 1, categoryGstRate = null) => {
    const effectiveGstRate = resolveGstRate(product, categoryGstRate);
    const price = Number(product.price || 0);

    if (product.priceType === 'inclusive') {
        return calculateGSTInclusive(price, quantity, effectiveGstRate);
    }
    return calculateGSTExclusive(price, quantity, effectiveGstRate);
};

/**
 * Aggregate GST across all cart items.
 * Each item must have: { price, quantity, priceType?, customGstRate?, categoryGstRate? }
 *
 * @param {Array} items - Cart/order items
 * @returns {{ subtotal, totalCGST, totalSGST, totalGST, grandTotal, gstBreakdown }}
 */
const calculateCartGST = (items = []) => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalGST = 0;
    const gstBreakdown = []; // Per-item breakdown for invoice

    for (const item of items) {
        const qty = item.quantity || 1;
        const categoryGstRate = item.categoryGstRate !== undefined ? item.categoryGstRate : null;
        const gst = calculateProductGST(item, qty, categoryGstRate);

        subtotal += gst.basePrice;
        totalCGST += gst.cgst;
        totalSGST += gst.sgst;
        totalGST += gst.totalGST;

        gstBreakdown.push({
            name: item.productName || item.name || 'Product',
            qty,
            basePrice: gst.basePrice,
            gstRate: gst.gstRate,
            cgst: gst.cgst,
            sgst: gst.sgst,
            totalGST: gst.totalGST,
            finalPrice: gst.finalPrice
        });
    }

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalCGST: parseFloat(totalCGST.toFixed(2)),
        totalSGST: parseFloat(totalSGST.toFixed(2)),
        totalGST: parseFloat(totalGST.toFixed(2)),
        grandTotal: parseFloat((subtotal + totalGST).toFixed(2)),
        gstBreakdown
    };
};

module.exports = {
    VALID_GST_SLABS,
    DEFAULT_GST_RATE,
    resolveGstRate,
    calculateGSTExclusive,
    calculateGSTInclusive,
    calculateProductGST,
    calculateCartGST
};
