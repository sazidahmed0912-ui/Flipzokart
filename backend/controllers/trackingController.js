const Order = require('../models/Order');

// @desc    Get tracking information by tracking ID or order ID
// @route   GET /api/tracking/:trackingId
// @access  Public (tracking should be accessible via link)
const getTrackingInfo = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order by ID
        const order = await Order.findById(orderId)
            .populate('user', 'name email mobile')
            .populate('products.productId', 'name image price description');

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
                    // But for simplicity in this strict mode, we might just show dynamic flow
                    // Better approach matching user request:
                } else {
                    // Future statuses
                    events.push({ status: s, date: null, completed: false });
                }
            });

            // Re-implementing the robust map from previous code but simpler
            const statusMap = {
                'Pending': [{ status: 'Processing', date: null, completed: false }],
                'Processing': [{ status: 'Processing', date: updatedAt, completed: true }, { status: 'Packed', date: null, completed: false }],
                'Packed': [{ status: 'Processing', date: updatedAt, completed: true }, { status: 'Packed', date: updatedAt, completed: true }, { status: 'Shipped', date: null, completed: false }],
                'Shipped': [
                    { status: 'Processing', date: updatedAt, completed: true },
                    { status: 'Packed', date: updatedAt, completed: true },
                    { status: 'Shipped', date: updatedAt, completed: true },
                    { status: 'Out for Delivery', date: null, completed: false }
                ],
                'Out for Delivery': [
                    { status: 'Processing', date: updatedAt, completed: true },
                    { status: 'Packed', date: updatedAt, completed: true },
                    { status: 'Shipped', date: updatedAt, completed: true },
                    { status: 'Out for Delivery', date: updatedAt, completed: true },
                    { status: 'Delivered', date: null, completed: false }
                ],
                'Delivered': [
                    { status: 'Processing', date: updatedAt, completed: true },
                    { status: 'Packed', date: updatedAt, completed: true },
                    { status: 'Shipped', date: updatedAt, completed: true },
                    { status: 'Out for Delivery', date: updatedAt, completed: true },
                    { status: 'Delivered', date: updatedAt, completed: true }
                ]
            };

            return [...events, ...(statusMap[status] || [])];
        };

        // Tax and Total Calculations
        // Assuming database stores final total. Re-calculating components for display if not saved explicitly
        const subtotal = order.subtotal || order.products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shippingFee = order.deliveryCharges || 0;
        const tax = order.tax || (subtotal * 0.18); // Example 18% GST if not in DB
        const grandTotal = order.total || (subtotal + shippingFee + tax);

        // Flatten Address for easy usage
        const shippingAddress = {
            name: order.user?.name || address.fullName || 'Valued Customer',
            phone: address.phone || address.mobile || order.user?.mobile || '',
            address: address.street || address.address || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || address.zip || ''
        };

        // Strict JSON Response
        res.json({
            // Required Top Level Fields
            orderId: order._id,
            createdAt: order.createdAt,
            status: order.status,
            paymentStatus: order.paymentStatus || 'Paid',

            // Items with exact keys requested
            items: order.products.map(p => ({
                productName: p.name || p.productId?.name || 'Product', // User requested 'productName'
                name: p.name || p.productId?.name || 'Product', // Keep 'name' for backward compat
                quantity: p.quantity,
                price: p.price,
                total: p.price * p.quantity,
                image: p.image || p.productId?.image // Extra for UI
            })),

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
                shippingTo: shippingAddress.name,
                shippingFrom: 'Flipzokart Warehouse'
            }
        });

    } catch (error) {
        console.error('Error fetching tracking info:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTrackingInfo
};
