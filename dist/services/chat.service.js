"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const prisma = new client_1.PrismaClient();
class ChatService {
    async startChat(userId) {
        // Check if there is an open chat
        let chat = await prisma.chat.findFirst({
            where: { userId, status: client_1.ChatStatus.OPEN },
            include: { messages: true },
        });
        if (!chat) {
            chat = await prisma.chat.create({
                data: { userId, status: client_1.ChatStatus.OPEN },
                include: { messages: true },
            });
        }
        return chat;
    }
    async getChatHistory(chatId) {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!chat)
            throw new AppError_1.AppError('Chat not found', 404);
        return chat;
    }
    async addMessage(chatId, sender, message) {
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
            where: { status: client_1.ChatStatus.OPEN },
            include: { user: { select: { name: true, email: true } } },
        });
    }
}
exports.ChatService = ChatService;
