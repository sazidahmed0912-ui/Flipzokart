const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb('Images only!');
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Single Upload (Legacy/Profile)
router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        const filePath = `/uploads/${req.file.filename}`;
        // Standardize response for single upload too if possible, but keep string for backward compat if needed
        // For now, keeping legacy string response for existing parts, but recommended to switch to JSON
        res.send(filePath);
    } else {
        res.status(400).send('No file uploaded');
    }
});

// Multiple Uploads (Product Gallery) - STRICT JSON RESPONSE
router.post('/multiple', upload.array('image', 10), (req, res) => {
    if (req.files && req.files.length > 0) {
        const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({
            success: true,
            urls: fileUrls
        });
    } else {
        res.status(400).json({ success: false, message: 'No files uploaded' });
    }
});

module.exports = router;
