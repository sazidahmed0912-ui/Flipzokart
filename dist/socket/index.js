"use strict";
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
    io.use(async (socket, next) => {
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
    });
    io.on('connection', (socket) => {
        console.log('User connected', socket.userId);
        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });
        socket.on('send_message', async (data) => {
            const { chatId, message } = data;
            const userId = socket.userId;
            // Save to DB
            const chatMessage = await prisma.chatMessage.create({
                data: {
                    chatId,
                    sender: userId, // Simplified, in real app check if user is support or customer
                    message,
                },
            });
            io.to(chatId).emit('receive_message', chatMessage);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
exports.initSocket = initSocket;
