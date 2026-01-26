const Order = require('../models/Order');

// @desc    Get tracking information by tracking ID or order ID
// @route   GET /api/tracking/:trackingId
// @access  Public (tracking should be accessible via link)
const getTrackingInfo = async (req, res) => {
    try {
        const { trackingId } = req.params;

        // Find order by ID
        const order = await Order.findById(trackingId)
            .populate('user', 'name email')
            .populate('products.productId', 'name image');

        if (!order) {
            return res.status(404).json({
                message: 'Tracking information not found',
                error: 'TRACKING_NOT_FOUND'
            });
        }

        // Map order status to tracking events
        const statusToEvents = (status, createdAt, updatedAt) => {
            const events = [
                {
                    status: 'Order Placed',
                    date: createdAt,
                    completed: true
                }
            ];

            const statusMap = {
                'Pending': [
                    { status: 'Processing', date: null, completed: false }
                ],
                'Processing': [
                    { status: 'Processing', date: updatedAt, completed: true },
                    { status: 'Packed', date: null, completed: false }
                ],
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
                ],
                'Cancelled': [
                    { status: 'Cancelled', date: updatedAt, completed: true }
                ]
            };

            return [...events, ...(statusMap[status] || [])];
        };

        // Get shipping address details
        const address = order.shippingAddress || {};
        const userName = order.user?.name || address.fullName || address.name || 'Valued Customer';

        // Format tracking data
        const trackingData = {
            trackingId: order._id.toString(),
            orderId: order.orderId || order._id.toString().slice(-8).toUpperCase(),
            status: order.status || 'PENDING',
            shippingTo: userName,
            shippingFrom: 'Flipzokart Warehouse',
            address: {
                street: address.street || address.address || '',
                city: address.city || '',
                state: address.state || '',
                pincode: address.pincode || address.zip || '',
                phone: address.phone || address.mobile || ''
            },
            orderDate: order.createdAt,
            updatedAt: order.updatedAt,
            estimatedDelivery: order.estimatedDelivery || null,
            events: statusToEvents(order.status, order.createdAt, order.updatedAt),
            products: order.products.map(item => ({
                name: item.name || item.productId?.name || 'Product',
                image: item.image || item.productId?.image || '',
                quantity: item.quantity,
                price: item.price || item.productId?.price || 0
            })),
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus
        };

        res.json({
            success: true,
            data: trackingData
        });

    } catch (error) {
        console.error('Error fetching tracking info:', error);

        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                message: 'Invalid tracking ID format',
                error: 'INVALID_TRACKING_ID'
            });
        }

        res.status(500).json({
            message: 'Failed to fetch tracking information',
            error: 'SERVER_ERROR'
        });
    }
};

module.exports = {
    getTrackingInfo
};
