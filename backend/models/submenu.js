const mongoose = require('mongoose');

const submenuSchema = new mongoose.Schema({
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
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
    },
    link: {
        type: String,
        default: '' // Optional override link
    }
}, {
    timestamps: true,
    collection: 'submenus'
});

submenuSchema.index({ subcategoryId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Submenu', submenuSchema);
