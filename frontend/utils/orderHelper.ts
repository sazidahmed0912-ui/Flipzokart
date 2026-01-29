import { getSafeAddress } from './addressHelper';

export const normalizeOrder = (order: any) => {
    if (!order) return null;
    // Reject HTML strings or non-objects
    if (typeof order !== 'object') return null;

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
    // 3. Normalize Totals
    const itemsPrice = order.itemsPrice !== undefined ? order.itemsPrice : (order.subtotal || items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0));
    const tax = order.tax || order.taxPrice || 0;
    const shipping = order.deliveryCharges !== undefined ? order.deliveryCharges : (order.shipping || order.shippingPrice || 0);
    const platformFee = order.platformFee || 0;
    const discount = order.discount || 0;

    // Prefer 'total' from my schema, then fallback
    const grandTotal = order.total !== undefined ? order.total : (order.totalAmount || order.totalPrice || order.grandTotal || 0);

    return {
        ...order,
        id: order._id || order.id,
        items,
        address, // Safe Address Object
        totals: {
            itemsPrice,
            subtotal: itemsPrice, // Alias
            tax,
            shipping,
            platformFee,
            discount,
            grandTotal,
            total: grandTotal // Alias
        },
        payment: {
            method: order.paymentMethod || order.paymentInfo?.method || 'N/A',
            status: order.paymentStatus || order.paymentInfo?.status || 'Pending',
            isPaid: order.isPaid || false
        },
        createdAt: order.createdAt || new Date().toISOString()
    };
};
