import express from 'express';
import helmetExport from 'helmet';
import cors from 'cors';
import type { RequestHandler } from 'express';
import type { HelmetOptions } from 'helmet';
import v1Router from './routes/v1/api.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { ipRateLimiter } from './middlewares/rateLimitMiddleware.js';
import redisClient from './libs/redis.js';
import prismaClient from './libs/database.js';
import swaggerUi from 'swagger-ui-express';
import { verifyDeviceId } from './middlewares/authMiddleware.js';
import { asyncHandler } from './types/asyncHandler.js';
import { generateOpenAPISpec } from './libs/openapi.js';

const helmet = helmetExport as unknown as (options?: HelmetOptions) => RequestHandler;

const initApp = async () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: '*',
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

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

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateOpenAPISpec()));

  app.use(errorHandler);

  app.use(
    asyncHandler((_, res) => {
      res.status(404).json({ error: 'Route not found' });
    })
  );

  return app;
};

export default initApp;
