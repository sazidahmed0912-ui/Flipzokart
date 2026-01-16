const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['newOrder', 'orderStatusUpdate', 'lowStock', 'adminNewOrder', 'userRegistration', 'general'],
    default: 'general',
  },
  relatedId: { // To link to an order, product, or user
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
