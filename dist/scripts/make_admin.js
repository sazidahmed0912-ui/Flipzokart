"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function makeAdmin() {
    const email = 'final_test_user_3@example.com';
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`User ${user.email} promoted to ADMIN.`);
    }
    catch (error) {
        console.error('Error promoting user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
makeAdmin();
