import { User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: User; // or UserPayload if you decode JWT
        }
    }
}
