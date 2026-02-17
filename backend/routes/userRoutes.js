const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, getActivities, getDeviceHistory, appealUser, getAddresses, saveAddress, updateAddress, getUserLocations } = require('../controllers/userController');
const protect = require('../middleware/protect');

router.use(protect); // All routes are protected

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/activity', getActivities);
router.get('/devices', getDeviceHistory);
router.post('/appeal', appealUser);

router.get('/locations', getUserLocations);
router.post('/update-location', require('../controllers/userController').updateListLocation);

// Recently Viewed Products
router.post('/recently-viewed', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID required' });
        }

        const User = require('../models/User');

        // Remove duplicate if exists
        await User.findByIdAndUpdate(userId, {
            $pull: { recentlyViewed: productId }
        });

        // Add to position 0 (front)
        await User.findByIdAndUpdate(userId, {
            $push: {
                recentlyViewed: {
                    $each: [productId],
                    $position: 0
                }
            }
        });

        // Keep only 5 items
        await User.findByIdAndUpdate(userId, {
            $push: {
                recentlyViewed: {
                    $each: [],
                    $slice: 5
                }
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update recently viewed', error: error.message });
    }
});

router.get('/recently-viewed', async (req, res) => {
    try {
        const userId = req.user.id;
        const User = require('../models/User');

        const user = await User.findById(userId).populate({
            path: 'recentlyViewed',
            match: { isActive: { $ne: false } } // Only active products
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out any null products (deleted products)
        const products = (user.recentlyViewed || []).filter(p => p !== null);

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch recently viewed', error: error.message });
    }
});

router.route('/address')
    .get(getAddresses)
    .post(saveAddress);

router.delete('/address/:id', require('../controllers/userController').deleteAddress);
router.put('/address/:id', updateAddress);

module.exports = router;
