const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, getActivities, getDeviceHistory } = require('../controllers/userController');
const protect = require('../middleware/protect');

router.use(protect); // All routes are protected

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/activity', getActivities);
router.get('/devices', getDeviceHistory);

module.exports = router;
