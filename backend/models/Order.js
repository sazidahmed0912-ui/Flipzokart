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
      name: String, // Snapshot
      image: String, // Snapshot
      price: Number, // Snapshot
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
    type: String,
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
  total: {
    type: Number,
    required: true,
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
