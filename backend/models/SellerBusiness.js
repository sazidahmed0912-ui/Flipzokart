const mongoose = require('mongoose');

const sellerBusinessSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    gstin: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    pan: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('SellerBusiness', sellerBusinessSchema);
