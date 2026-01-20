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
app.use(cors());
app.use(json());
app.get('/', (req, res) => {
    res.send({ message: 'Welcome to Flipzokart API' });
});

console.log('Mounting routes...');
app.use('/api/v1', router);
app.use('/admin', adminRoutes); // Support header-less frontend path
console.log('Routes mounted.');

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
