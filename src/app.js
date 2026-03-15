import express from "express";
import helmet from "helmet";
import cors from "cors";
import mainRouter from "./routes/api.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import { ipRateLimiter } from "./middlewares/rateLimitMiddleware.js";
import redisClient from "./libs/redis.js";
import environment from "./configs/environment.js";
import prismaClient from "./libs/database.js";
import swaggerSpec from "./configs/swagger.js";
import swaggerUi from "swagger-ui-express";
import { verifyDeviceId } from "./middlewares/authMiddleware.js";
import AppError from './errors/AppError.js';

const initApp = async () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: function (origin, callback) {
        callback(null, environment.frontend.url);
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Motqen API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));

  app.use("/api",
    verifyDeviceId,
    ipRateLimiter,
    mainRouter);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date(),
      database: prismaClient ? "connected" : "disconnected",
      redis: redisClient.isReady ? "connected" : "disconnected",
    });
  });




  // API JSON documentation endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use((req, _, next) => {
    next(new AppError('Route not found', 404, null, 'ROUTE_NOT_FOUND'));
  });

  app.use(errorHandler);



  return app;
};

export default initApp;
