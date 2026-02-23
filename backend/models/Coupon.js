const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['PERCENTAGE', 'FLAT', 'FREE_SHIPPING', 'BOGO', 'BUY_X_GET_Y', 'MIN_CART_VALUE', 'CATEGORY_SPECIFIC', 'PRODUCT_SPECIFIC'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    maxDiscount: {
        type: Number,
    },
    minCartValue: {
        type: Number,
        default: 0,
    },
    usageLimit: {
        type: Number,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    usageLimitPerUser: {
        type: Number,
        default: 1,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE',
    },
    conditions: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        /**
         * expects:
         * {
         *   allowedCategories: [ObjectId],
         *   excludedCategories: [ObjectId],
         *   allowedProducts: [ObjectId],
         *   excludedProducts: [ObjectId],
         *   paymentRestriction: String ('PREPAID', 'COD'),
         *   firstOrderOnly: Boolean,
         *   specificPincodes: [String],
         *   buyX: Number,
         *   getY: Number
         * }
         */
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
