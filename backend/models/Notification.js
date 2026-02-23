const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["order", "user", "system", "newOrder", "adminNewOrder"], // Extended to keep compatibility but fulfill requirement
    default: "order"
  },
  message: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  recipient: { // Keeping for backward compatibility if needed, but making optional
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
