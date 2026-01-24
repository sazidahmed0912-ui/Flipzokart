import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/appeal', protect, userController.submitAppeal);
router.post('/upload-avatar', protect, upload.single('avatar'), userController.uploadAvatar);
// router.get('/user/profile', protect, userController.getProfile);

export default router;
