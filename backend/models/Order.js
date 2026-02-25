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
        required: true,
      },
      variantId: String, // Variant Snapshot
      productName: String, // Snapshot
      color: String, // Snapshot
      size: String, // Snapshot
      image: String, // Snapshot
      price: Number, // Snapshot
      quantity: {
        type: Number,
        required: true,
      },
      // Keep selectedVariants for backward compatibility if needed, but user wants specific fields
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
  razorpayPaymentId: {
    type: String,
  },
  couponSnapshot: {
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    code: String,
    discountType: String,   // renamed from 'type' — avoids Mongoose reserved keyword conflict
    discountAmount: Number,
    appliedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    freeItems: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantityFreed: Number,
      priceFreed: Number
    }]
  },
  // 🔒 PAYMENT MODE AUDIT SNAPSHOT (Security Integrity)
  // Stores the exact payment restrictions of each product at time of order.
  // Used for dispute resolution and backend security logs.
  paymentModeSnapshot: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    codAvailable: { type: Boolean, default: true },
    prepaidAvailable: { type: Boolean, default: true }
  }],
  // Real-Time Tracking Fields
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String,
    updatedAt: Date
  },
  deliveryAgent: {
    name: String,
    phone: String,
    vehicle: String
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
