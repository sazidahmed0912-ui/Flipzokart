const mongoose = require('mongoose');

const homepageCategoryIconSchema = new mongoose.Schema({
    categoryName: {
        type: String, // Matching the string based category system
        required: true
    },
    iconUrl: {
        type: String,
        required: true
    },
    redirectUrl: {
        type: String,
        default: '' // Optional custom redirect override
    },
    position: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HomepageCategoryIcon', homepageCategoryIconSchema);
