import { CartItem } from '../types';

export const calculateCartTotals = (cartItems: CartItem[]) => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);
    const originalPrice = cartItems.reduce((acc, item) => acc + ((item.originalPrice || 0) * item.quantity), 0);

    // Safety check for discount
    const discount = originalPrice > subtotal ? originalPrice - subtotal : 0;

    // Standardized Logic
    const deliveryCharges = subtotal > 500 ? 0 : 40;
    const platformFee = 3;

    const totalAmount = subtotal + deliveryCharges + platformFee;

    return {
        totalItems,
        subtotal, // This is the selling price total
        originalPrice,
        discount,
        deliveryCharges,
        platformFee,
        totalAmount
    };
};
