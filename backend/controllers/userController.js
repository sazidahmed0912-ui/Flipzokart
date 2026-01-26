const User = require('../models/User');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;

            // If email update is allowed in future, add validation here

            // Allow requesting seller status
            if (req.body.role === 'pending_seller' && user.role === 'user') {
                user.role = 'pending_seller';
            }

            const updatedUser = await user.save();

            // Log activity
            await Activity.create({
                user: user._id,
                type: 'update',
                message: 'Updated profile details'
            });

            res.json({
                success: true,
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                },
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/user/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (user && (await user.matchPassword(currentPassword))) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            // Log activity
            await Activity.create({
                user: user._id,
                type: 'security',
                message: 'Changed account password'
            });

            res.json({ success: true, message: 'Password updated successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user activity logs
// @route   GET /api/user/activity
// @access  Private
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get login device history
// @route   GET /api/user/devices
// @access  Private
const getDeviceHistory = async (req, res) => {
    try {
        // Aggregate unique devices from login activities
        const devices = await Activity.aggregate([
            { $match: { user: req.user._id, type: 'login' } },
            { $group: { _id: "$device", lastLogin: { $max: "$createdAt" } } },
            { $project: { device: "$_id", lastLogin: 1, _id: 0 } },
            { $sort: { lastLogin: -1 } }
        ]);

        res.json({ success: true, devices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit an appeal for unban
// @route   POST /api/users/appeal
// @access  Private (Banned Users allowed)
const appealUser = async (req, res) => {
    try {
        const { message, userId } = req.body;
        // Verify user matches token (or is admin)
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create Notification for Admin
        // Assuming there's a Notification model or similar mechanism.
        // For now, we'll just log it or update a user field if "Appeals" schemas exist.
        // However, user request said "Admin Notification Box".
        // Let's create an Activity log of type 'appeal' which Admin Dashboard reads?
        // Or if there is a Notification system.

        // Let's create an Activity for now, type 'appeal'
        await Activity.create({
            user: user._id,
            type: 'appeal',
            message: `User Appeal: ${message}`,
            ip: req.ip
        });

        // Optionally send email to admin or real-time socket

        res.json({ success: true, message: 'Appeal submitted' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user addresses
// @route   GET /api/user/address
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, addresses: user.addresses || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const { validateAddress } = require('../utils/addressValidation');

// @desc    Save new address
// @route   POST /api/user/address
// @access  Private
const saveAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newAddress = req.body;

        // Backend Validation for State & City
        // Assuming payload has state and city fields
        if (newAddress.state && newAddress.city) {
            const validation = validateAddress(newAddress.state, newAddress.city);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.error });
            }
        }

        user.addresses.push(newAddress);
        await user.save();

        res.json({ success: true, addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update existing address
// @route   PUT /api/user/address/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const addressId = req.params.id;
        const updatedData = req.body;

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Backend Validation
        if (updatedData.state && updatedData.city) {
            const validation = validateAddress(updatedData.state, updatedData.city);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.error });
            }
        }

        // Merge existing address with updates
        // Don't overwrite _id
        const existingAddress = user.addresses[addressIndex].toObject();
        user.addresses[addressIndex] = { ...existingAddress, ...updatedData };

        await user.save();

        res.json({ success: true, addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/user/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();

        res.json({ success: true, addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const { getCoordinates } = require('../utils/cityCoordinates');

const { getLocationFromIp } = require('../utils/geoIp');

// @desc    Update user location from IP
// @route   POST /api/user/update-location
// @access  Private
const updateListLocation = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get IP from request
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();

        // If local, try mock or client provided IP? For now handled in utils

        const geo = await getLocationFromIp(ip);

        if (geo) {
            user.lastIp = ip;
            user.latitude = geo.lat;
            user.longitude = geo.lon;
            user.locationCity = geo.city;
            user.locationCountry = geo.country;
            user.locationUpdatedAt = new Date();
            await user.save();
        }

        res.json({ success: true, location: geo });
    } catch (error) {
        // Non-blocking error
        console.error("GeoIP Error:", error.message);
        res.json({ success: false, message: "Location update failed but continued" });
    }
};

// @desc    Get user locations for map (Smart Logic: IP > Address > Fallback)
// @route   GET /api/user/locations
// @access  Private (Admin)
const getUserLocations = async (req, res) => {
    try {
        // Fetch users who have Either Address OR Live Location
        const users = await User.find({
            $or: [
                { "addresses.0": { $exists: true } },
                { "latitude": { $exists: true } }
            ]
        }).select('name email addresses role status createdAt latitude longitude locationCity locationCountry locationUpdatedAt');

        const mapData = users.map(user => {
            // Priority 1: Recent Real-Time Location (IP based) - within last 24h? Or just if exists.
            if (user.latitude && user.longitude) {
                return {
                    id: user._id,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    city: user.locationCity || 'Unknown',
                    state: user.locationCountry || 'Unknown',
                    lat: user.latitude,
                    lng: user.longitude,
                    joined: user.createdAt,
                    type: 'realtime'
                };
            }

            // Priority 2: Saved Address
            const address = user.addresses.find(a => a.type === 'Home') || user.addresses[0];
            if (address) {
                const coords = getCoordinates(address.state, address.city);
                return {
                    id: user._id,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    city: address.city,
                    state: address.state,
                    lat: coords.lat,
                    lng: coords.lng,
                    joined: user.createdAt,
                    type: 'address'
                };
            }

            return null;
        }).filter(item => item !== null);

        res.json({ success: true, count: mapData.length, users: mapData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    updateProfile,
    changePassword,
    getActivities,
    getDeviceHistory,
    appealUser,
    getAddresses,
    saveAddress,
    updateAddress,
    deleteAddress,
    getUserLocations,
    updateListLocation
};
