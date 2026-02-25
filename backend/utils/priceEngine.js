/**
 * 🏗️ MASTER PRICE ENGINE — Fzokart
 * ─────────────────────────────────────────────────────────────
 * GOLDEN RULE:
 *   ✅ Only Payment Summary API and Order Create may call this.
 *   ❌ Order Success, Invoice, My Orders: read DB values ONLY.
 * ─────────────────────────────────────────────────────────────
 */

const round = (num) => Math.round(Number(num) * 100) / 100;

/**
 * Calculate full order summary.
 * Items must have: { price, quantity, gstRate, priceType? }
 *
 * @param {object} params
 * @param {Array}  params.items          - Cart items with price, qty, gstRate, priceType
 * @param {number} params.deliveryCharge - Shipping fee (₹)
 * @param {number} params.platformFee    - Platform handling fee (₹)
 * @param {number} params.discount       - Validated coupon discount (₹)
 */
const calculateOrderSummary = ({
    items = [],
    deliveryCharge = 0,
    platformFee = 3,
    discount = 0
}) => {
    let subtotal = 0;
    let totalGST = 0;

    const calculatedItems = items.map(item => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 1);
        const gstRate = Number(item.gstRate ?? item.customGstRate ?? 18);   // default 18%
        const priceType = item.priceType || 'exclusive';

        let baseAmount = price * quantity;
        let gstAmount = 0;

        if (priceType === 'inclusive') {
            // Price already includes GST — extract base
            const baseWithoutGST = baseAmount / (1 + gstRate / 100);
            gstAmount = round(baseAmount - baseWithoutGST);
            baseAmount = round(baseWithoutGST);
        } else {
            // Exclusive — add GST on top
            gstAmount = round((baseAmount * gstRate) / 100);
        }

        subtotal += baseAmount;
        totalGST += gstAmount;

        const cgst = round(gstAmount / 2);
        const sgst = round(gstAmount / 2);

        return {
            // Preserve all original item fields (for order product snapshot)
            ...item,
            // 🔒 Frozen price breakdown
            unitPrice: price,
            baseAmount: round(baseAmount),
            gstRate,
            cgst,
            sgst,
            totalGST: gstAmount,
            finalAmount: round(baseAmount + gstAmount)
        };
    });

    subtotal = round(subtotal);
    totalGST = round(totalGST);
    deliveryCharge = round(Number(deliveryCharge) || 0);
    platformFee = round(Number(platformFee) || 3);
    discount = round(Number(discount) || 0);

    // CGST / SGST at order level
    const cgst = round(totalGST / 2);
    const sgst = round(totalGST / 2);

    const grandTotal = round(
        subtotal +
        totalGST +
        deliveryCharge +
        platformFee -
        discount
    );

    return {
        items: calculatedItems,
        subtotal,       // Pre-GST base total
        totalGST,       // Total GST charged
        cgst,           // CGST (50% of totalGST)
        sgst,           // SGST (50% of totalGST)
        deliveryCharge,
        platformFee,
        discount,
        grandTotal      // What customer actually pays
    };
};

/**
 * Resolve delivery charge based on cart total + payment method.
 * @param {number} grandTotalPreDelivery  - subtotal + GST
 * @param {string} paymentMethod          - 'COD' | 'RAZORPAY'
 * @returns {number}
 */
const resolveDeliveryCharge = (grandTotalPreDelivery, paymentMethod = 'COD') => {
    if (grandTotalPreDelivery >= 499) return 0;
    return paymentMethod === 'COD' ? 50 : 0;
};

module.exports = {
    round,
    calculateOrderSummary,
    resolveDeliveryCharge
};
