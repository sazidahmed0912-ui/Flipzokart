import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { AppError } from '../utils/AppError';

const router = Router();

router.post('/', upload.single('file'), (req, res, next) => {
    if (!req.file) {
        return next(new AppError('No file uploaded', 400));
    }

    // Return relative path. The frontend 'imageHelper' will prepend URL.
    // req.file.path is typically 'uploads\\filename'. 
    // We should normalize it to forward slashes.
    const relativePath = req.file.path.replace(/\\/g, '/');

    res.status(200).json({
        status: 'success',
        path: relativePath,
        url: `${req.protocol}://${req.get('host')}/${relativePath}`
    });
});

export default router;
