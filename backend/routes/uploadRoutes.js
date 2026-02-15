const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

const router = express.Router();

// 1. Cloudinary Config (Strictly from ENV)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Memory Storage (Don't save to disk on Render)
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif|mp4|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb('Images and Videos only!');
}

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Helper: Stream Upload to Cloudinary
const uploadToCloudinary = (buffer, folder = 'flipzokart_products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: 'auto' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
    });
};

// Single Upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded');

        const result = await uploadToCloudinary(req.file.buffer, 'flipzokart_single');
        // Return the secure URL directly (legacy format expected string path, but URL works too if frontend handles it)
        res.send(result.secure_url);
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).send('Upload failed');
    }
});

// Multiple Uploads
router.post('/multiple', upload.array('image', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        // Parallel Uploads
        const uploadPromises = req.files.map(file =>
            uploadToCloudinary(file.buffer, 'flipzokart_products')
        );

        const results = await Promise.all(uploadPromises);
        const fileUrls = results.map(r => r.secure_url);

        res.json({
            success: true,
            urls: fileUrls
        });
    } catch (error) {
        console.error('Cloudinary Multiple Upload Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

module.exports = router;
