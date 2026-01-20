import { PrismaClient, ChatStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class ChatService {
    async startChat(userId: string) {
        // Check if there is an open chat
        let chat = await prisma.chat.findFirst({
            where: { userId, status: ChatStatus.OPEN },
            include: { messages: true },
        });

        if (!chat) {
            chat = await prisma.chat.create({
                data: { userId, status: ChatStatus.OPEN },
                include: { messages: true },
            });
        }

        return chat;
    }

    async getChatHistory(chatId: string) {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!chat) throw new AppError('Chat not found', 404);
        return chat;
    }

    async addMessage(chatId: string, sender: string, message: string) {
        return await prisma.chatMessage.create({
            data: {
                chatId,
                sender,
                message,
            },
        });
    }

    async getAllChats() {
        return await prisma.chat.findMany({
            where: { status: ChatStatus.OPEN },
            include: { user: { select: { name: true, email: true } } },
        });
    }
}
