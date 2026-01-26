const express = require('express');
const router = express.Router();
const { getTrackingInfo } = require('../controllers/trackingController');

// Public route - no authentication required for tracking
router.get('/:orderId', getTrackingInfo);

module.exports = router;
