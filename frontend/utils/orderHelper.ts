import { getSafeAddress } from './addressHelper';

export const normalizeOrder = (order: any) => {
    if (!order) return null;

    // 1. Normalize Items
    // Mapping rules: items -> orderItems -> products -> cartItems -> []
    let rawItems = order.items || order.orderItems || order.products || order.cartItems || [];

    // Ensure items is an array
    if (!Array.isArray(rawItems)) {
        rawItems = [];
    }

    const items = rawItems.map((item: any) => ({
        ...item,
        name: item.name || item.title || item.product?.title || 'Unknown Product',
        price: item.price || item.product?.price || 0,
        quantity: item.quantity || item.qty || 1,
        image: item.image || item.product?.image || item.product?.images?.[0] || '',
        productId: item.productId || item.product?._id || item._id
    }));

    // 2. Normalize Address using existing helper + fallback aliases
    const rawAddress = order.address || order.shippingAddress || order.shippingInfo || order.user || {};
    const address = getSafeAddress(rawAddress);

    // 3. Normalize Totals
    const totalAmount = order.totalAmount || order.totalPrice || order.grandTotal || 0;
    const subtotal = order.subtotal || items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const tax = order.tax || order.taxPrice || 0;
    const shipping = order.shipping || order.shippingPrice || order.deliveryCharges || 0;

    return {
        ...order,
        id: order._id || order.id,
        items,
        address, // Safe Address Object
        totals: {
            subtotal,
            tax,
            shipping,
            grandTotal: totalAmount
        },
        payment: {
            method: order.paymentMethod || order.paymentInfo?.method || 'N/A',
            status: order.paymentStatus || order.paymentInfo?.status || 'Pending',
            isPaid: order.isPaid || false
        },
        createdAt: order.createdAt || new Date().toISOString()
    };
};
