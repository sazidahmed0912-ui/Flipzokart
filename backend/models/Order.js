const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false, // Allow keeping history even if product reference is lost/problematic
      },
      name: String, // Snapshot
      image: String, // Snapshot
      price: Number, // Snapshot
      colour: String, // Snapshot
      size: String, // Snapshot
      sku: String, // Snapshot
      totalPrice: Number, // Snapshot (price * quantity)
      quantity: {
        type: Number,
        required: true,
      },
      selectedVariants: {
        type: Map,
        of: String
      }
    },
  ],
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed, // Allow full object storage
    required: true,
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: 'PENDING',
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0,
  },
  platformFee: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryCharges: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  mrp: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  orderSummary: {
    itemsPrice: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    deliveryCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 }
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
