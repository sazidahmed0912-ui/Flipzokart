import { CartItem } from '@/app/types';

/**
 * 🔒 Client-side display helper ONLY.
 * ❌ NOT used for any authoritative price calculation.
 * ✅ Server's /api/cart/summary is the source of truth.
 *
 * This function provides a quick estimate for immediate UI render
 * before the server response arrives. GST is NOT calculated here.
 */
export const calculateCartTotals = (
    cartItems: CartItem[],
    customDelivery?: number,
    paymentMethod?: 'COD' | 'RAZORPAY' | null,
    couponDiscount: number = 0
) => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const itemsPrice = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
    const originalPrice = cartItems.reduce((acc, item) => acc + (((item as any).originalPrice || item.price || 0) * item.quantity), 0);
    const discount = originalPrice > itemsPrice ? originalPrice - itemsPrice : 0;

    let deliveryCharges = 0;
    if (customDelivery !== undefined) {
        deliveryCharges = customDelivery;
    } else if (itemsPrice >= 499) {
        deliveryCharges = 0;
    } else {
        deliveryCharges = paymentMethod === 'COD' ? 50 : 0;
    }

    const platformFee = 3;
    const tax = 0;
    const totalAmount = Math.max(0, itemsPrice + deliveryCharges + platformFee - couponDiscount);

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
        cgst: 0,
        sgst: 0,
        totalGST: 0,
        hasGST: false,
        totalAmount,
        totalPayable: totalAmount
    };
};
