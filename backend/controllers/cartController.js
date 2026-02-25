const User = require('../models/User');
const Product = require('../models/Product');
const { calculateOrderSummary, resolveDeliveryCharge } = require('../utils/priceEngine');
const couponController = require('./couponController');

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
                productId: item.productId._id, // 🟢 Critical: Frontend needs this for key generation
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
                selectedVariants: item.selectedVariants ? Object.fromEntries(item.selectedVariants) : undefined
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
            productId: item.productId || item.id,
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
// @route   POST /api/cart/merge
// @access  Private
const mergeCart = async (req, res) => {
    try {
        const { items } = req.body; // Expecting array of guest cart items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(200).json({ message: 'No items to merge' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Helper to generate a comparable key for variants
        const getVariantKey = (variants) => {
            if (!variants) return '';
            let variantObj = variants;

            // Handle Mongoose Map or Standard Map
            if (variants instanceof Map || (variants && typeof variants.get === 'function')) {
                variantObj = {};
                // Mongoose Map uses .forEach or for..of
                if (variants.forEach) {
                    variants.forEach((v, k) => { variantObj[k] = v; });
                }
            }

            return Object.entries(variantObj)
                .sort(([k1], [k2]) => k1.localeCompare(k2))
                .map(([k, v]) => `${k}:${v}`)
                .join('|');
        };

        // Merge Logic
        items.forEach(guestItem => {
            const guestVariantKey = getVariantKey(guestItem.selectedVariants);

            // Find if this item already exists in user's cart
            const existingItemIndex = user.cart.findIndex(userItem => {
                const userVariantKey = getVariantKey(userItem.selectedVariants);
                return userItem.productId.toString() === guestItem.productId && userVariantKey === guestVariantKey;
            });

            if (existingItemIndex > -1) {
                // Update quantity
                user.cart[existingItemIndex].quantity += guestItem.quantity;
            } else {
                // Add new item
                user.cart.push({
                    productId: guestItem.productId,
                    quantity: guestItem.quantity,
                    selectedVariants: guestItem.selectedVariants
                });
            }
        });

        await user.save();

        // Return updated cart (same format as getCart)
        // We can just call getCart logic here or let frontend refetch. 
        // Returning success message is enough as frontend will refetch.
        res.json({ success: true, message: 'Cart merged successfully' });

    } catch (error) {
        console.error('Error merging cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc   Server-authoritative price summary (GST + shipping + coupon)
 * @route  POST /api/cart/summary
 * @access Private
 */
const cartSummary = async (req, res) => {
    try {
        const { cartItems, couponCode, paymentMethod = 'COD' } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ message: 'cartItems required' });
        }

        // 🔒 ULTRA LOCK: Fetch all prices FRESH from DB — never trust frontend prices
        const productIds = cartItems.map(i => i.productId || i.id);
        const dbProducts = await Product.find({ _id: { $in: productIds }, isDeleted: { $ne: true } }).lean();

        if (dbProducts.length === 0) {
            return res.status(404).json({ message: 'No valid products found' });
        }

        // Build engine-ready items (flat format with gstRate + priceType from DB)
        const engineItems = cartItems.map(cartItem => {
            const pid = (cartItem.productId || cartItem.id)?.toString();
            const product = dbProducts.find(p => p._id.toString() === pid);
            if (!product) return null;
            return {
                price: Number(product.price || 0),
                quantity: Number(cartItem.quantity) || 1,
                gstRate: product.customGstRate ?? 18,  // product override or default slab
                priceType: product.priceType || 'exclusive',
                // Metadata for cart display
                name: product.name,
                image: product.thumbnail || product.images?.[0] || product.image || '',
                productId: product._id.toString()
            };
        }).filter(Boolean);

        // Estimate subtotal+GST to resolve delivery
        const prelimSubtotal = engineItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const deliveryCharge = resolveDeliveryCharge(prelimSubtotal, paymentMethod);
        const platformFee = 3;

        // 🎟️ Validate coupon server-side
        let couponDiscount = 0;
        let couponMeta = null;
        if (couponCode) {
            try {
                const couponResult = await couponController.validateAndCalculateDiscount(
                    req.user.id,
                    engineItems.map(i => ({ price: i.price, quantity: i.quantity, productId: i.productId })),
                    couponCode,
                    paymentMethod
                );
                if (couponResult && couponResult.isValid) {
                    couponDiscount = couponResult.discountAmount || 0;
                    couponMeta = { code: couponCode, discountAmount: couponDiscount };
                }
            } catch (err) {
                console.warn('[CartSummary] Coupon validation failed:', err.message);
            }
        }

        // 🏗️ Run master price engine (read-only — no DB write here)
        const summary = calculateOrderSummary({
            items: engineItems,
            deliveryCharge,
            platformFee,
            discount: couponDiscount
        });

        return res.json({ ...summary, coupon: couponMeta });

    } catch (error) {
        console.error('[CartSummary] Error:', error);
        res.status(500).json({ message: 'Server error computing cart summary' });
    }
};

module.exports = {
    getCart,
    updateCart,
    mergeCart,
    cartSummary
};
