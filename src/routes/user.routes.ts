import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
// import { protect } from '../middlewares/auth.middleware'; // To be implemented

const router = Router();
const userController = new UserController();

router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
// router.get('/user/profile', protect, userController.getProfile);

export default router;
