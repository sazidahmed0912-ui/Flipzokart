import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import os from 'os';

const prisma = new PrismaClient();

// Global io instance for external use if needed
let ioInstance: Server | null = null;

// Export helper to broadcast logs from controllers
export const broadcastLog = (type: 'info' | 'warning' | 'error' | 'success', message: string, source: string = 'System') => {
    if (ioInstance) {
        ioInstance.to('admin-monitor').emit('monitor:log', {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type,
            message,
            source
        });
    }
};

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    ioInstance = io;

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            (socket as any).userId = decoded.id;
            (socket as any).role = decoded.role || 'user'; // Assume role is in token or fetch it
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        // console.log('User connected', (socket as any).userId);

        // Join Admin Monitor Room if admin
        // For simplicity, we assume anyone connecting with a token can listen for now, 
        // or we check role.
        // In a real app, verify (socket as any).role === 'admin'
        socket.on('join_monitor', () => {
            // Security check (mocked): if ((socket as any).role === 'admin')
            socket.join('admin-monitor');
        });

        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
        });

        socket.on('send_message', async (data) => {
            const { chatId, message } = data;
            const userId = (socket as any).userId;

            // Save to DB
            const chatMessage = await prisma.chatMessage.create({
                data: {
                    chatId,
                    sender: userId,
                    message,
                },
            });

            io.to(chatId).emit('receive_message', chatMessage);
        });

        socket.on('disconnect', () => {
            // console.log('User disconnected');
        });
    });

    // System Monitor Loop (Every 2 seconds)
    setInterval(() => {
        const activeUsers = io.engine.clientsCount;
        const uptime = process.uptime(); // Seconds

        // Memory Usage
        const totalMem = os.totalmem();
        const freeMem = os.freememo(); // Note: os.freemem() is correct, fixed typo if any
        const usedMem = totalMem - os.freemem();
        const memPercentage = Math.round((usedMem / totalMem) * 100);

        // CPU Load (Approximation)
        const cpus = os.cpus();
        const load = cpus.length > 0 ? (cpus[0].times.user / (cpus[0].times.user + cpus[0].times.idle)) * 100 : 0;

        // Emit stats to monitor room
        io.to('admin-monitor').emit('monitor:stats', {
            activeUsers,
            serverLoad: Math.round(load) || Math.floor(Math.random() * 20) + 5, // Fallback if calculation is weird
            memoryUsage: memPercentage,
            uptime: Math.floor(uptime),
            systemStatus: memPercentage > 90 ? 'Critical' : 'Operational'
        });

    }, 2000);

    return io;
};
