import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import v1Router from './routes/v1/api.js';
import adminRouter from './routes/v1/admin/index.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { ipRateLimiter } from './middlewares/rateLimitMiddleware.js';
import redisClient from './libs/redis.js';
import prismaClient from './libs/database.js';
import swaggerUi from 'swagger-ui-express';
import { verifyDeviceId } from './middlewares/authMiddleware.js';
import { asyncHandler } from './types/asyncHandler.js';
import { generateOpenAPISpec, generateAdminOpenAPISpec } from './libs/openapi.js';
import webhooksRouter from './routes/v1/webhooks.js';
import environment from './configs/environment.js';

const initApp: () => Promise<express.Application> = async () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow both 5173 and 5174 for development flexibility
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:5174',
          environment.frontend.url
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // Allow credentials (cookies)
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-device-fingerprint'],
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/webhooks', webhooksRouter);

  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1', verifyDeviceId, ipRateLimiter, v1Router);

  // Health check
  app.get(
    '/health',
    asyncHandler((_, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        database: prismaClient ? 'connected' : 'disconnected',
        redis: redisClient.isReady ? 'connected' : 'disconnected',
      });
    })
  );

  app.get('/docs/v1/swagger.json', (_, res) => res.json(generateOpenAPISpec()));
  app.get('/docs/admin/swagger.json', (_, res) => res.json(generateAdminOpenAPISpec()));

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      explorer: true,
      swaggerOptions: {
        urls: [
          { url: '/docs/v1/swagger.json', name: 'App API V1' },
          { url: '/docs/admin/swagger.json', name: 'Admin API' },
        ],
      },
    })
  );

  app.use(errorHandler);

  app.use(
    asyncHandler((_, res) => {
      res.status(404).json({ error: 'Route not found' });
    })
  );

  return app;
};

export default initApp;
