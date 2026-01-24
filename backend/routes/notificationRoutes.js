const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

router.route('/')
  .get(protect, getNotifications)
  .delete(protect, deleteAllNotifications);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

module.exports = router;
