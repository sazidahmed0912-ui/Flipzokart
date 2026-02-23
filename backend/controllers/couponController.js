const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const Order = require('../models/Order');
const User = require('../models/User');

exports.createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon({
            ...req.body,
            code: req.body.code.toUpperCase()
        });
        await coupon.save();
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const coupon = await Coupon.findByIdAndUpdate(id, { status }, { new: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCouponStats = async (req, res) => {
    try {
        const totalCoupons = await Coupon.countDocuments();
        const activeCoupons = await Coupon.countDocuments({ status: 'ACTIVE' });
        const usageAgg = await Coupon.aggregate([
            { $group: { _id: null, totalUsages: { $sum: '$usageCount' } } }
        ]);
        const totalUsages = usageAgg.length > 0 ? usageAgg[0].totalUsages : 0;

        res.status(200).json({
            success: true,
            data: { totalCoupons, activeCoupons, totalUsages }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Engine Logic ---
exports.validateAndCalculateDiscount = async (userId, cartItems, couponCode, paymentMethod) => {
    console.log(`[CouponEngine] Validating coupon: ${couponCode} for user: ${userId}, payment: ${paymentMethod}`);
    if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
        throw new Error('Invalid coupon code');
    }

    if (coupon.status !== 'ACTIVE') {
        throw new Error('This coupon is currently inactive');
    }

    const now = new Date();
    if (now < coupon.startDate) {
        throw new Error('Coupon is not yet valid');
    }
    if (now > coupon.expiryDate) {
        throw new Error('Coupon has expired');
    }

    // Usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
    }

    const userUsages = await CouponUsage.countDocuments({
        coupon: coupon._id,
        user: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId
    });
    if (coupon.usageLimitPerUser && userUsages >= coupon.usageLimitPerUser) {
        throw new Error('You have already used this coupon maximum allowed times');
    }

    // Calculate Cart Total (Gross)
    let cartTotal = 0;
    for (const item of cartItems) {
        // Handle variations between frontend cart obj and backend cart obj
        const price = item.price || item.product?.price || 0;
        const qty = item.quantity || 1;
        cartTotal += price * qty;
    }

    // Condition Validation
    if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
        throw new Error(`Minimum cart value of ₹${coupon.minCartValue} is required`);
    }

    const conditions = coupon.conditions || {};

    if (conditions.paymentRestriction && paymentMethod) {
        if (conditions.paymentRestriction.toUpperCase() !== paymentMethod.toUpperCase()) {
            throw new Error(`This coupon is only valid for ${conditions.paymentRestriction} payments`);
        }
    }

    if (conditions.firstOrderOnly) {
        const previousOrders = await Order.countDocuments({ user: userId });
        if (previousOrders > 0) {
            throw new Error('This coupon is only valid for your first order');
        }
    }

    // Calculate Discount based on Engine Logic
    let discountAmount = 0;
    let finalCartTotal = cartTotal;
    let freeItems = [];
    let appliedProducts = [];

    switch (coupon.type) {
        case 'PERCENTAGE':
            discountAmount = cartTotal * (coupon.discountValue / 100);
            break;
        case 'FLAT':
            discountAmount = coupon.discountValue;
            break;
        case 'FREE_SHIPPING':
            discountAmount = 0; // Handled separately or as special flag
            break;
        case 'CATEGORY_SPECIFIC': {
            let allowedCats = conditions.allowedCategories || [];
            if (typeof allowedCats === 'string') allowedCats = [allowedCats]; // fallback

            let applicableTotal = 0;
            for (const item of cartItems) {
                const catId = item.categoryId || item.product?.category?.toString() || item.category;
                if (catId && allowedCats.includes(catId.toString())) {
                    const price = item.price || item.product?.price || 0;
                    applicableTotal += price * item.quantity;
                    appliedProducts.push(item.productId || item.product?._id);
                }
            }
            if (applicableTotal === 0) throw new Error('No eligible products in cart for this coupon');
            discountAmount = applicableTotal * (coupon.discountValue / 100);
            break;
        }
        case 'PRODUCT_SPECIFIC': {
            let allowedProds = conditions.allowedProducts || [];
            if (typeof allowedProds === 'string') allowedProds = [allowedProds];

            let applicableTotal = 0;
            for (const item of cartItems) {
                const pId = (item.productId || item.id || item.product?._id || '').toString();
                if (pId && allowedProds.includes(pId)) {
                    const price = item.price || item.product?.price || 0;
                    applicableTotal += price * item.quantity;
                    appliedProducts.push(pId);
                }
            }
            if (applicableTotal === 0) throw new Error('No eligible products in cart for this coupon');
            discountAmount = applicableTotal * (coupon.discountValue / 100);
            break;
        }
        case 'BOGO': {
            let eligibleItems = [...cartItems];
            let allowedCats = conditions.allowedCategories || [];
            if (typeof allowedCats === 'string') allowedCats = [allowedCats];

            if (allowedCats.length > 0) {
                eligibleItems = eligibleItems.filter(item => {
                    const catId = item.categoryId || item.product?.category?.toString() || item.category;
                    return catId && allowedCats.includes(catId.toString());
                });
            }

            let totalEligibleQuantity = eligibleItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

            if (totalEligibleQuantity < 2) {
                throw new Error('You need at least 2 eligible items in cart for BOGO');
            }

            // Sort by price ascending
            eligibleItems.sort((a, b) => {
                const priceA = a.price || a.product?.price || 0;
                const priceB = b.price || b.product?.price || 0;
                return priceA - priceB;
            });

            const freeItemCount = Math.floor(totalEligibleQuantity / 2);
            let currentFreeAllocated = 0;

            for (const item of eligibleItems) {
                if (currentFreeAllocated >= freeItemCount) break;

                const price = item.price || item.product?.price || 0;
                const qty = item.quantity || 1;
                const canFree = Math.min(qty, freeItemCount - currentFreeAllocated);

                discountAmount += price * canFree;
                currentFreeAllocated += canFree;

                const pId = item.productId || item.id || item.product?._id;
                freeItems.push({ productId: pId, quantityFreed: canFree, priceFreed: price });
                appliedProducts.push(pId);
            }
            break;
        }
        case 'BUY_X_GET_Y': {
            const buyX = conditions.buyX || 1;
            let totalXQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

            if (totalXQuantity < buyX) {
                throw new Error(`You need to buy at least ${buyX} items to get the discount`);
            }
            discountAmount = coupon.discountValue;
            break;
        }
        case 'MIN_CART_VALUE': {
            if (cartTotal >= coupon.minCartValue) {
                discountAmount = coupon.discountValue;
            } else {
                throw new Error(`Minimum cart value of ₹${coupon.minCartValue} required`);
            }
            break;
        }
    }

    // Enforce Max Discount Cap
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
    }

    // Prevent negative total
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
    }

    finalCartTotal = cartTotal - discountAmount;

    return {
        isValid: true,
        couponCode: coupon.code,
        type: coupon.type,
        discountAmount: Math.floor(discountAmount),
        finalCartTotal: Math.floor(finalCartTotal),
        cartTotal: Math.floor(cartTotal),
        freeItems,
        appliedProducts,
        isFreeShipping: coupon.type === 'FREE_SHIPPING',
        couponId: coupon._id
    };
};

exports.applyCoupon = async (req, res) => {
    try {
        const { couponCode, paymentMethod } = req.body;
        const userId = req.user._id;

        if (!couponCode) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }

        // Fetch user with populated cart
        const user = await User.findById(userId).populate('cart.productId');

        if (!user || !user.cart || user.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }

        // Map cart items to format expected by engine
        const cartItems = user.cart.map(item => ({
            productId: item.productId?._id,
            price: item.productId?.price,
            quantity: item.quantity,
            categoryId: item.productId?.category?.toString(),
            name: item.productId?.name
        })).filter(item => item.productId); // removes items with deleted products

        const result = await exports.validateAndCalculateDiscount(userId, cartItems, couponCode, paymentMethod);

        res.status(200).json({ success: true, result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
