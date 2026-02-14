import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import mainRouter from "./routes/api.js";
import  errorHandler  from "./middlewares/errorHandlerMiddleware.js";
import redisClient from "./lib/redis.js";
import environment from "./config/environment.js";
import prisma from "./lib/database.js";

const initApp = async () => {
  const app = express();

  app.use(express.json());
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: environment.api.rateLimit.windowMs,
      limit: environment.api.rateLimit.max,
      legacyHeaders: false,
    }),
  );
  app.use(
    cors({
      origin: function (origin, callback) {
        callback(null, environment.frontend.url);
      },
    }),
  );

  app.use("/api", mainRouter);

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date(),
      database: prisma ? "connected" : "disconnected",
      redis: redisClient.isReady ? "connected" : "disconnected",
    });
  });

  app.use(errorHandler);

  app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
  });

  prisma
    .$connect()
    .then(() => console.log("Connected to PostgreSQL database"))
    .catch((err) =>
      console.error("Error connecting to PostgreSQL database:", err),
    );


  return app;
};

export default initApp;
