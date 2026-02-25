import { CartItem } from '@/app/types';

// 🧾 India GST default rate (matches backend DEFAULT_GST_RATE)
const DEFAULT_GST_RATE = 18;

/**
 * Calculate GST for a single cart item.
 * If item has `customGstRate`, use it. Otherwise fall back to DEFAULT_GST_RATE.
 * Supports inclusive (GST already in price) and exclusive (GST added on top).
 */
const calcItemGST = (item: CartItem & { customGstRate?: number | null; priceType?: string }) => {
    const gstRate = (item.customGstRate !== null && item.customGstRate !== undefined)
        ? Number(item.customGstRate)
        : DEFAULT_GST_RATE;

    const qty = item.quantity || 1;

    if (item.priceType === 'inclusive') {
        // Price includes GST → extract base price
        const finalPrice = (item.price || 0) * qty;
        const basePrice = finalPrice / (1 + gstRate / 100);
        const totalGST = finalPrice - basePrice;
        return { basePrice, totalGST, cgst: totalGST / 2, sgst: totalGST / 2, finalPrice, gstRate };
    } else {
        // Price is base → add GST on top
        const basePrice = (item.price || 0) * qty;
        const totalGST = (basePrice * gstRate) / 100;
        return { basePrice, totalGST, cgst: totalGST / 2, sgst: totalGST / 2, finalPrice: basePrice + totalGST, gstRate };
    }
};

export const calculateCartTotals = (
    cartItems: CartItem[],
    customDelivery?: number,
    paymentMethod?: 'COD' | 'RAZORPAY' | null,
    couponDiscount: number = 0
) => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Aggregate GST across items
    let subtotalBase = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalGST = 0;

    for (const item of cartItems) {
        const gst = calcItemGST(item as any);
        subtotalBase += gst.basePrice;
        totalCGST += gst.cgst;
        totalSGST += gst.sgst;
        totalGST += gst.totalGST;
    }

    const itemsPrice = parseFloat(subtotalBase.toFixed(2));
    const itemsPlusGST = parseFloat((subtotalBase + totalGST).toFixed(2));

    // originalPrice is the sum of MRP
    const originalPrice = cartItems.reduce((acc, item) => acc + (((item as any).originalPrice || item.price || 0) * item.quantity), 0);
    const discount = originalPrice > itemsPrice ? originalPrice - itemsPrice : 0;

    // Delivery Logic — threshold based on itemsPrice + GST
    let deliveryCharges = 0;
    if (customDelivery !== undefined) {
        deliveryCharges = customDelivery;
    } else if (itemsPlusGST >= 499) {
        deliveryCharges = 0;
    } else {
        deliveryCharges = (paymentMethod === 'COD') ? 50 : 0;
    }

    const platformFee = 3;
    const tax = parseFloat(totalGST.toFixed(2)); // Backward compat alias

    const subTotalWithDelivery = itemsPlusGST + deliveryCharges + platformFee;
    const totalAmount = parseFloat(Math.max(0, subTotalWithDelivery - couponDiscount).toFixed(2));

    return {
        totalItems,
        itemsPrice,
        subtotal: itemsPrice,
        originalPrice,
        discount,
        couponDiscount,
        deliveryCharges,
        platformFee,
        tax,
        // 🧾 GST Breakdown
        cgst: parseFloat(totalCGST.toFixed(2)),
        sgst: parseFloat(totalSGST.toFixed(2)),
        totalGST: parseFloat(totalGST.toFixed(2)),
        hasGST: totalGST > 0,
        totalAmount,
        totalPayable: totalAmount
    };
};
