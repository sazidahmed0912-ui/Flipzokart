const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, getActivities, getDeviceHistory, appealUser, getAddresses, saveAddress } = require('../controllers/userController');
const protect = require('../middleware/protect');

router.use(protect); // All routes are protected

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/activity', getActivities);
router.get('/devices', getDeviceHistory);
router.post('/appeal', appealUser);

router.route('/address')
    .get(getAddresses)
    .post(saveAddress);

router.delete('/address/:id', require('../controllers/userController').deleteAddress);

module.exports = router;
