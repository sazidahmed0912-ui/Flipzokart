import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json } from 'body-parser';
import router from './routes';
import { globalErrorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(helmet());
app.use(helmet());

const corsOptions = {
    origin: ['https://www.flipzokart.com', 'http://localhost:5173', 'http://localhost:3000', 'https://flipzokart.vercel.app', 'https://flipzokart-backend.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true, parameterLimit: 1000000 }));
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to Flipzokart API v2.0 (Fixes Applied)', status: 'active' });
});

console.log('Mounting routes...');
app.use('/api', router);
app.use('/admin', adminRoutes); // Support header-less frontend path
console.log('Routes mounted.');

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
