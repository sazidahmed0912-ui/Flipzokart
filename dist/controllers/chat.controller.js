"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
const catchAsync_1 = require("../utils/catchAsync");
const chatService = new chat_service_1.ChatService();
class ChatController {
    constructor() {
        this.startChat = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const chat = await chatService.startChat(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { chat },
            });
        });
        this.getChatHistory = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const chat = await chatService.getChatHistory(req.params.chatId);
            res.status(200).json({
                status: 'success',
                data: { chat },
            });
        });
        this.getAllChats = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
            const chats = await chatService.getAllChats();
            res.status(200).json({
                status: 'success',
                data: { chats },
            });
        });
    }
}
exports.ChatController = ChatController;
