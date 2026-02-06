
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
    const email = 'admin@flipzokart.com';
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log(`User ${email} NOT FOUND.`);
            // Create if specific test user needed or just error out?
            // For now, let's create a dummy admin if missing, helps testing.
            const newUser = await prisma.user.create({
                data: {
                    name: 'Admin User',
                    email: email,
                    password: 'hashed_password_placeholder', // They can't login but row exists
                    role: 'ADMIN',
                    isVerified: true
                }
            });
            console.log(`Created new ADMIN user: ${email}`);
            return;
        }

        console.log(`User found. Current Role: ${user.role}`);

        if (user.role !== 'ADMIN') {
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log(`Successfully promoted ${email} to ADMIN.`);
        } else {
            console.log(`${email} is already an ADMIN.`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

promoteToAdmin();
