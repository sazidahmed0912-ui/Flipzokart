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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HomepageBanner', homepageBannerSchema);
