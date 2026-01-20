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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = socket.handshake.auth.token;
            if (!token)
                return next(new Error('Authentication error'));
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            socket.userId = decoded.id;
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    }));
    io.on('connection', (socket) => {
        console.log('User connected', socket.userId);
        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });
        socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { chatId, message } = data;
            const userId = socket.userId;
            // Save to DB
            const chatMessage = yield prisma.chatMessage.create({
                data: {
                    chatId,
                    sender: userId, // Simplified, in real app check if user is support or customer
                    message,
                },
            });
            io.to(chatId).emit('receive_message', chatMessage);
        }));
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
exports.initSocket = initSocket;
