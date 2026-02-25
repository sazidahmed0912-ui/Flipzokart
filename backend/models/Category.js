const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    bannerUrl: {
        type: String,
        default: ''
    },
    mobileBannerUrl: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    pageLayout: {
        type: Array,
        default: []
    },
    draftLayout: {
        type: Array,
        default: []
    },
    // 🧾 GST SLAB — India GST: 0, 5, 12, 18, 28
    gstRate: {
        type: Number,
        enum: [0, 5, 12, 18, 28],
        default: 18
    }
}, {
    timestamps: true,
    collection: 'categories'
});

module.exports = mongoose.model('Category', categorySchema);
