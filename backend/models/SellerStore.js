const mongoose = require('mongoose');

const sellerStoreSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    storeName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Electronics',
            'Fashion',
            'Home & Kitchen',
            'Beauty & Personal Care',
            'Grocery',
            'Mobiles',
            'Other'
        ]
    },
    storeDescription: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SellerStore', sellerStoreSchema);
