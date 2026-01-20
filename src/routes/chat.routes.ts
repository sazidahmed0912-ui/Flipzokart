import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const chatController = new ChatController();

router.use(protect);

router.post('/start', chatController.startChat);
router.get('/:chatId', chatController.getChatHistory);

router.get('/admin/all', restrictTo('ADMIN', 'SUPPORT'), chatController.getAllChats);

export default router;
