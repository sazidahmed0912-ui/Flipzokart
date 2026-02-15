const mongoose = require('mongoose');

const homepageBannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    mobileImageUrl: {
        type: String,
        required: false // Optional, fallback to desktop if missing
    },
    redirectUrl: {
        type: String,
        default: ''
    },
    position: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    section: {
        type: String,
        default: 'main', // 'main', 'secondary', etc. if needed later
        enum: ['main']
    },
    // Compatibility fields for legacy/imported data
    banner: { type: String },
    image: { type: String }
}, {
    timestamps: true,
    collection: 'homepage_banners',
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Robust getter for imageUrl to handle field mismatches (banner vs image vs imageUrl)
homepageBannerSchema.path('imageUrl').get(function (v) {
    return v || this.banner || this.image;
});

module.exports = mongoose.model('HomepageBanner', homepageBannerSchema);
