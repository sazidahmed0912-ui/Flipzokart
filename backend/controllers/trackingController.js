const Order = require('../models/Order');

// @desc    Get tracking information by tracking ID or order ID
// @route   GET /api/tracking/:trackingId
// @access  Public (tracking should be accessible via link)
const getTrackingInfo = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order by ID
        const order = await Order.findById(orderId)
            .populate('user', 'name email mobile');
        // .populate('products.productId'); // ❌ FORBIDDEN: Snapshot only

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Map order status to tracking events
        const statusToEvents = (status, createdAt, updatedAt) => {
            // Base event
            const events = [{ status: 'Order Placed', date: createdAt, completed: true }];

            // Status flow mapping
            const statusFlow = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
            let currentFound = false;

            if (status === 'Cancelled') {
                events.push({ status: 'Cancelled', date: updatedAt, completed: true });
                return events;
            }

            statusFlow.forEach(s => {
                // If we found the current status, this one is completed + timestamp
                if (status === s) {
                    events.push({ status: s, date: updatedAt, completed: true });
                    currentFound = true;
                } else if (!currentFound) {
                    // Previous statuses (assumed completed if current is advanced)
                    // Simplified logic: If existing status is 'Shipped', then 'Packed' is effectively done
                    events.push({ status: s, date: updatedAt, completed: true }); // Approximation
                } else {
                    // Future statuses
                    events.push({ status: s, date: null, completed: false });
                }
            });
            return events;
        };

        // Tax and Total Calculations
        const subtotal = order.subtotal || order.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shippingFee = order.deliveryCharges || 0;
        const tax = order.tax || (subtotal * 0.18); // Example 18% GST if not in DB
        const grandTotal = order.total || (subtotal + shippingFee + tax);

        // Address Handling (Fixing ReferenceError)
        const rawAddress = order.shippingAddress || {};
        const user = order.user || {};

        const shippingAddress = {
            name: rawAddress.fullName || rawAddress.name || user.name || 'Valued Customer',
            phone: rawAddress.phone || rawAddress.mobile || user.mobile || '',
            address: rawAddress.street || rawAddress.address || '',
            city: rawAddress.city || '',
            state: rawAddress.state || '',
            pincode: rawAddress.pincode || rawAddress.zip || ''
        };

        // Strict JSON Response
        res.json({
            // Required Top Level Fields
            orderId: order._id, // User requested 'orderId'
            _id: order._id, // Backward compat
            createdAt: order.createdAt,
            orderStatus: order.status, // User requested 'orderStatus'
            status: order.status, // Backward compat
            paymentMethod: order.paymentMethod, // Required for Invoice (COD/Prepaid)
            paymentStatus: order.paymentStatus || 'Paid',

            // Items with exact keys requested
            items: order.products.map(p => {
                const price = p.price || 0;
                return {
                    productId: p.productId,
                    productName: p.productName || p.name || 'Product', // Snapshot name
                    name: p.productName || p.name || 'Product', // Backward compat
                    quantity: p.quantity,
                    price: price, // Snapshot price
                    subtotal: price * p.quantity,
                    total: price * p.quantity,
                    image: p.image || '', // Snapshot Image
                    color: p.color, // Snapshot Color
                    size: p.size, // Snapshot Size
                    variantId: p.variantId
                };
            }),

            // Address Object
            shippingAddress: shippingAddress,
            address: shippingAddress, // Keep 'address' alias for backward compat

            // Totals
            subtotal: Math.round(subtotal),
            tax: Math.round(tax),
            shippingFee: Math.round(shippingFee),
            grandTotal: Math.round(grandTotal),

            // Legacy support for TrackOrderPage
            trackingData: {
                trackingId: order._id,
                status: order.status,
                events: statusToEvents(order.status, order.createdAt, order.updatedAt),
                shippingFrom: 'Flipzokart Warehouse'
            },

            // Real-Time Fields (Critical for Map)
            currentLocation: order.currentLocation,
            statusHistory: order.statusHistory || [],

            // Real-Time Fields (Critical for Map)
            currentLocation: order.currentLocation,
            statusHistory: order.statusHistory || []
        });

    } catch (error) {
        console.error('Error fetching tracking info:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTrackingInfo
};
