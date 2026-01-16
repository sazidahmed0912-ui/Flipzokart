const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { getDashboardStats } = require('../controllers/adminController');

router.route('/dashboard-stats')
  .get(protect, authorize(['admin']), getDashboardStats);

module.exports = router;
