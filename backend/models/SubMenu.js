const mongoose = require('mongoose');

const subMenuSchema = new mongoose.Schema({
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    icon: { type: String }, // Optional icon for submenu items
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Index for faster lookups
subMenuSchema.index({ subcategoryId: 1, isActive: 1 });

const SubMenu = mongoose.model('SubMenu', subMenuSchema);

module.exports = SubMenu;
