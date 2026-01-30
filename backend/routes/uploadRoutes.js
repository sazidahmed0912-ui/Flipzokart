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

router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        // Return relative path or full URL depending on how you serve static files
        // Here we return a path that needs to be served. 
        // We will mount '/uploads' in server.js to serve these statically.
        // Assuming server is at root, result is "/uploads/filename.jpg"
        const filePath = `/uploads/${req.file.filename}`;
        res.send(filePath);
    } else {
        res.status(400).send('No file uploaded');
    }
});

// Also support multiple files if needed later
router.post('/multiple', upload.array('images', 10), (req, res) => {
    if (req.files && req.files.length > 0) {
        const filePaths = req.files.map(file => `/uploads/${file.filename}`);
        res.send(filePaths);
    } else {
        res.status(400).send('No files uploaded');
    }
});

module.exports = router;
