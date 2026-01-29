import { CartItem } from '../types';

export const calculateCartTotals = (cartItems: CartItem[], customDelivery?: number) => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // itemsPrice is the sum of selling prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);

    // originalPrice is the sum of MRP
    const originalPrice = cartItems.reduce((acc, item) => acc + ((item.originalPrice || 0) * item.quantity), 0);

    // Discount on MRP
    const discount = originalPrice > itemsPrice ? originalPrice - itemsPrice : 0;

    // Standardized Logic: Use custom if provided, else default rule
    const deliveryCharges = customDelivery !== undefined
        ? customDelivery
        : (itemsPrice > 500 ? 0 : 40);

    const platformFee = 3;
    const tax = 0; // Currently 0, can be updated to 18% of itemsPrice if needed (e.g. itemsPrice * 0.18)

    const totalAmount = itemsPrice + deliveryCharges + platformFee + tax;

    return {
        totalItems,
        itemsPrice,
        subtotal: itemsPrice, // Alias for legacy code
        originalPrice,
        discount,
        deliveryCharges,
        platformFee,
        tax,
        totalAmount,
        totalPayable: totalAmount // Alias
    };
};
