import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            (socket as any).userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected', (socket as any).userId);

        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`User ${(socket as any).userId} joined chat ${chatId}`);
        });

        socket.on('send_message', async (data) => {
            const { chatId, message } = data;
            const userId = (socket as any).userId;

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
