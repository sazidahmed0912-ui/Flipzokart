const Coupon = require('../models/Coupon');

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
        const { isActive } = req.body;
        const coupon = await Coupon.findByIdAndUpdate(id, { isActive }, { new: true });
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
        const activeCoupons = await Coupon.countDocuments({ isActive: true });
        const usageAgg = await Coupon.aggregate([
            { $group: { _id: null, totalUsages: { $sum: '$usedCount' } } }
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

// 🧠 ULTRA SAFE INTERNAL HELPER
exports.validateAndCalculateDiscount = async (userId, cartTotal, code) => {
    const coupon = await Coupon.findOne({
        code: code.toUpperCase()
    });

    if (!coupon) throw new Error("Invalid coupon code");
    if (!coupon.isActive) throw new Error("Coupon inactive");
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) throw new Error("Coupon expired");
    if (coupon.usedCount >= coupon.usageLimit) throw new Error("Coupon usage limit reached");
    if (cartTotal < coupon.minOrderAmount) throw new Error(`Minimum order ₹${coupon.minOrderAmount} required`);

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
    } else if (coupon.discountType === "flat") {
        discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, cartTotal);
    const finalTotal = cartTotal - discountAmount;

    return {
        isValid: true,
        couponId: coupon._id,
        couponCode: coupon.code,
        discountType: coupon.discountType,
        discountAmount: Math.floor(discountAmount),
        finalTotal: Math.floor(finalTotal),
        cartTotal: Math.floor(cartTotal)
    };
};

// 🧠 ULTRA SAFE APPLY COUPON ROUTE
exports.applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        if (!code) return res.status(400).json({ success: false, message: "Coupon code is required" });

        const result = await exports.validateAndCalculateDiscount(req.user.id, cartTotal, code);
        res.json({ success: true, result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
