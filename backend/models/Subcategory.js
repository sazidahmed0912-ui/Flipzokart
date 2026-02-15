const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    iconUrl: {
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
    }
}, {
    timestamps: true
});

// Ensure unique subcategory name per category if desired, but slug should definitely be unique per category context or globally.
// For simplicity, we'll index slug.
subcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);
