import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import v1Router from './routes/v1/api.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { ipRateLimiter } from './middlewares/rateLimitMiddleware.js';
import redisClient from './libs/redis.js';
import prismaClient from './libs/database.js';
import swaggerUi from 'swagger-ui-express';
import { verifyDeviceId } from './middlewares/authMiddleware.js';
import { asyncHandler } from './types/asyncHandler.js';
import { generateOpenAPISpec } from './libs/openapi.js';
import { logger } from './libs/winston.js'; // 👈 استيراد اللوجر

const initApp = async () => {
  const app = express();

  // 1. Security Middlewares
  app.use(helmet());
  app.use(cors({ origin: '*' }));
  
  // 2. Parsers
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // 3. 🛡️ Request Logging Middleware (تحقيق بوينت 10)
  // السطر ده هيسجل كل طلب داخل، والـ winston اللي عدلناه هيمسح منه التوكنز أوتوماتيك
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, { 
      metadata: { 
        ip: req.ip, 
        userAgent: req.headers['user-agent'] 
      } 
    });
    next();
  });

  // 4. API Routes
  app.use('/api/v1', verifyDeviceId, ipRateLimiter, v1Router);

  // 5. Health check
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

  // 6. Documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateOpenAPISpec()));

  // 7. Handle 404 Routes
  // يفضل تكون قبل الـ Error Handler مباشرة
  app.use(
    asyncHandler((_, res) => {
      res.status(404).json({ error: 'Route not found' });
    })
  );

  // 8. 🛡️ Global Error Handler (تحقيق بوينت 7)
  // لازم يكون آخر حاجة عشان يمسك أي Error من أي مكان فوقه
  app.use(errorHandler);

  return app;
};

export default initApp;