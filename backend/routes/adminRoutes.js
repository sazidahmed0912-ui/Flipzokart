const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getDashboardStats, getAllUsers, updateUserStatus, sendUserNotice,
  bulkUpdatePaymentMode, getGlobalPaymentSettings, updateGlobalPaymentSettings
} = require('../controllers/adminController');

router.route('/dashboard-stats')
  .get(protect, authorize(['admin']), getDashboardStats);

router.route('/users')
  .get(protect, authorize(['admin']), getAllUsers)
  .post(protect, authorize(['admin']), require('../controllers/adminController').createUser);

router.route('/users/:id/status')
  .put(protect, authorize(['admin']), updateUserStatus);

router.route('/users/:id/notice')
  .post(protect, authorize(['admin']), sendUserNotice);

router.route('/users/:id/role')
  .put(protect, authorize(['admin']), require('../controllers/adminController').updateUserRole);

router.route('/users/:id')
  .delete(protect, authorize(['admin']), require('../controllers/adminController').deleteUser);

// Order Status & Location
router.route('/orders/:id/status')
  .patch(protect, authorize(['admin']), require('../controllers/adminController').updateOrderStatus);

router.route('/orders/:id/location')
  .patch(protect, authorize(['admin']), require('../controllers/adminController').updateOrderLocation);

// 🔒 Payment Mode Control Routes
router.route('/products/payment-mode/bulk')
  .patch(protect, authorize(['admin']), bulkUpdatePaymentMode);

router.route('/settings/payment')
  .get(protect, authorize(['admin']), getGlobalPaymentSettings)
  .put(protect, authorize(['admin']), updateGlobalPaymentSettings);

module.exports = router;
