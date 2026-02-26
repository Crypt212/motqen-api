/**
 * @fileoverview API Routes - Main router combining all route modules
 * @module routes/api
 */

import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import governmentRouter from "./governments.js";
import specializationRouter from "./specializations.js";
import { authenticateActive, authenticateTokens } from "../middlewares/authMiddleware.js";
import { sensitiveIpRateLimiter } from "../middlewares/rateLimitMiddleware.js";

const mainRouter = Router();

mainRouter.use("/auth", sensitiveIpRateLimiter, authRouter);
mainRouter.use("/users", authenticateTokens(["access"]), authenticateActive, usersRouter);
mainRouter.use("/governments", governmentRouter);
mainRouter.use("/specializations", specializationRouter);

export default mainRouter;
