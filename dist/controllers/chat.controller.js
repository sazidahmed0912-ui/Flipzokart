"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
const catchAsync_1 = require("../utils/catchAsync");
const chatService = new chat_service_1.ChatService();
class ChatController {
    constructor() {
        this.startChat = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const chat = yield chatService.startChat(req.user.id);
            res.status(200).json({
                status: 'success',
                data: { chat },
            });
        }));
        this.getChatHistory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const chat = yield chatService.getChatHistory(req.params.chatId);
            res.status(200).json({
                status: 'success',
                data: { chat },
            });
        }));
        this.getAllChats = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const chats = yield chatService.getAllChats();
            res.status(200).json({
                status: 'success',
                data: { chats },
            });
        }));
    }
}
exports.ChatController = ChatController;
