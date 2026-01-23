const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['login', 'order', 'update', 'security'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    device: {
        type: String,
        default: 'Unknown Device'
    },
    ip: {
        type: String,
        default: '0.0.0.0'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Auto-delete activities older than 30 days
    }
});

module.exports = mongoose.model('Activity', activitySchema);
