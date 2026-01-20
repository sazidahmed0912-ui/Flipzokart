import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import { catchAsync } from '../utils/catchAsync';

const chatService = new ChatService();

export class ChatController {
    startChat = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const chat = await chatService.startChat((req as any).user.id);
        res.status(200).json({
            status: 'success',
            data: { chat },
        });
    });

    getChatHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const chat = await chatService.getChatHistory(req.params.chatId as string);
        res.status(200).json({
            status: 'success',
            data: { chat },
        });
    });

    getAllChats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const chats = await chatService.getAllChats();
        res.status(200).json({
            status: 'success',
            data: { chats },
        });
    });
}
