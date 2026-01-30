import { CartItem } from '@/app/types';

export const calculateCartTotals = (
    cartItems: CartItem[],
    customDelivery?: number,
    paymentMethod?: 'COD' | 'RAZORPAY' | null,
    couponDiscount: number = 0
) => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // itemsPrice is the sum of selling prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);

    // originalPrice is the sum of MRP
    const originalPrice = cartItems.reduce((acc, item) => acc + ((item.originalPrice || 0) * item.quantity), 0);

    // Discount on MRP
    const discount = originalPrice > itemsPrice ? originalPrice - itemsPrice : 0;

    // Delivery Logic:
    // 1. Override if provided (customDelivery)
    // 2. Free if cart >= 499
    // 3. If < 499:
    //    - COD: ₹50
    //    - Prepaid/Unknown: Free
    let deliveryCharges = 0;

    if (customDelivery !== undefined) {
        deliveryCharges = customDelivery;
    } else {
        if (itemsPrice >= 499) {
            deliveryCharges = 0; // FREE
        } else {
            // Below 499
            if (paymentMethod === 'COD') {
                deliveryCharges = 50;
            } else {
                deliveryCharges = 0; // Prepaid is free
            }
        }
    }

    const platformFee = 3;
    const tax = 0;

    // Safety: Prevent negative total
    const subTotalWithDelivery = itemsPrice + deliveryCharges + platformFee + tax;
    const totalAmount = Math.max(0, subTotalWithDelivery - couponDiscount);

    return {
        totalItems,
        itemsPrice,
        subtotal: itemsPrice, // Alias for legacy code
        originalPrice,
        discount,
        couponDiscount,
        deliveryCharges,
        platformFee,
        tax,
        totalAmount,
        totalPayable: totalAmount // Alias
    };
};
