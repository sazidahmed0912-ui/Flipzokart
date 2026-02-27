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
    let itemsPrice, tax, shipping, platformFee, discount, grandTotal;

    if (order.orderSummary) {
        const s = order.orderSummary;
        itemsPrice = s.itemsPrice || 0;
        tax = s.tax || 0;
        shipping = s.deliveryCharges || 0;
        platformFee = s.platformFee || 0;
        discount = s.discount || 0;
        grandTotal = s.finalAmount;
        // Strict check to preserve 0 if it is 0, but user said "Prevent zero fallback" for undefined.
        if (grandTotal === undefined || grandTotal === null) grandTotal = order.total || 0;
    } else {
        itemsPrice = order.itemsPrice !== undefined ? order.itemsPrice : (order.subtotal || 0);
        // 🔒 ULTRA LOCK — Never calculate from items. Use frozen DB values only.
        tax = order.tax || order.taxPrice || order.totalGST || 0;
        shipping = order.deliveryCharges !== undefined ? order.deliveryCharges : (order.deliveryCharge || order.shipping || order.shippingPrice || 0);
        platformFee = order.platformFee || 0;
        discount = order.couponDiscount || order.discount || 0;
        grandTotal = order.grandTotal !== undefined ? order.grandTotal : (order.total !== undefined ? order.total : (order.totalAmount || order.totalPrice || 0));
    }

    // 4. Strict Billing Data Resolution (Max Ultra Lock)
    // Name Priority: Billing Address -> Shipping Address -> Customer -> User
    const billingName =
        address?.fullName ||
        order.billingAddress?.fullName ||
        order.billingAddress?.name ||
        order.shippingAddress?.fullName ||
        order.shippingAddress?.name ||
        order.customer?.name ||
        order.user?.name ||
        'Guest'; // Only fallback if completely empty

    // Email Priority: Billing Address -> Customer -> User -> Order Root
    const billingEmail =
        order.billingAddress?.email ||
        order.customer?.email ||
        order.user?.email ||
        order.email ||
        'N/A';

    return {
        ...order,
        id: order._id || order.id,
        items,
        address, // Safe Address Object
        orderSummary: order.orderSummary,
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
        billingName,  // Normalized strict name
        billingEmail, // Normalized strict email
        payment: {
            method: order.paymentMethod || order.paymentInfo?.method || 'N/A',
            status: order.paymentStatus || order.paymentInfo?.status || 'Pending',
            isPaid: order.isPaid || false
        },
        createdAt: order.createdAt || new Date().toISOString()
    };
};
