// Express app: cors, helmet, rate limit, routes, error handling
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import dbConnect from './config/db.js';
import { initFirebase } from './config/firebase.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import propertyRoute from './routes/propertyRoute.js';
import requestRoute from './routes/requestRoute.js';
import unitRoute from './routes/unitRoute.js';
import leaseRoute from './routes/leaseRoute.js';
import residentRoute from './routes/residentRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import documentRoute from './routes/documentRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import { errorHandler, notFound } from './middleware/error.js';
import logger from './utils/logger.js';

const app = express();
const API_PREFIX = '/api/v1';

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.RATE_LIMMIT_MAX) || 300,
    standardHeaders: true,
    legacyHeaders: false,
}));

// Health check
app.get(`${API_PREFIX}/health`, (req, res) => {
    res.status(200).json({ success: true, status: 'ok', uptime: process.uptime() });
});

// Routes
app.use(`${API_PREFIX}/auth`, authRoute);
app.use(`${API_PREFIX}/users`, userRoute);
app.use(`${API_PREFIX}/properties`, propertyRoute);
app.use(`${API_PREFIX}/requests`, requestRoute);
app.use(`${API_PREFIX}/units`, unitRoute);
app.use(`${API_PREFIX}/leases`, leaseRoute);
app.use(`${API_PREFIX}/residents`, residentRoute);
app.use(`${API_PREFIX}/payments`, paymentRoute);
app.use(`${API_PREFIX}/documents`, documentRoute);
app.use(`${API_PREFIX}/notifications`, notificationRoute);

// 404 + global error handler — must be last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
    await dbConnect();
    initFirebase();

    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`API URL: http://localhost:${PORT}${API_PREFIX}`);
        logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    start();
}

export default app;
