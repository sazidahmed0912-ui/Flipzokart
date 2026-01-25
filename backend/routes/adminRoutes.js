const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { getDashboardStats, getAllUsers, updateUserStatus, sendUserNotice } = require('../controllers/adminController');

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

module.exports = router;
