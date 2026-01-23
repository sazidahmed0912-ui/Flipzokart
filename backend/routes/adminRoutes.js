const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { getDashboardStats, getAllUsers } = require('../controllers/adminController');

router.route('/dashboard-stats')
  .get(protect, authorize(['admin']), getDashboardStats);

router.route('/users')
  .get(protect, authorize(['admin']), getAllUsers);

module.exports = router;
