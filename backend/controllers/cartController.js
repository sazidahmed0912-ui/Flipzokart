const User = require('../models/User');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.productId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out items where product might have been deleted
        const cartItems = user.cart
            .filter(item => item.productId)
            .map(item => ({
                id: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                originalPrice: item.productId.originalPrice,
                image: item.productId.images?.[0] || item.productId.image || '',
                images: item.productId.images || [],
                stock: item.productId.countInStock,
                category: item.productId.category,
                rating: item.productId.rating,
                reviews: item.productId.numReviews,
                quantity: item.quantity,
                seller: item.productId.brand, // or seller field if matches
                quantity: item.quantity,
                seller: item.productId.brand, // or seller field if matches
                selectedVariants: item.selectedVariants ? Object.fromEntries(item.selectedVariants) : undefined,
                codAvailable: item.productId.codAvailable !== false,
                prepaidAvailable: item.productId.prepaidAvailable !== false
            }));

        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user's cart
// @route   PUT /api/cart
// @access  Private
const updateCart = async (req, res) => {
    try {
        const { cart } = req.body; // Expecting array of cart items

        // Transform frontend cart items to backend schema structure
        // Frontend item has 'id' (productId), backend needs 'productId'
        const cartToSave = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            selectedVariants: item.selectedVariants
        }));

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = cartToSave;
        await user.save();

        res.json({ message: 'Cart updated', cart: user.cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCart,
    updateCart
};
