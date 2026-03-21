/**
 * @fileoverview API Routes - Main router combining all route modules
 * @module routes/api
 */

import { Router } from "express";
import authRouter from "./auth.js";
import dashboardRouter from "./dashboard.js";
import governmentRouter from "./governments.js";
import specializationRouter from "./specializations.js";
import chatRouter from "./chat.js";
import { isActive, authenticateAccess } from "../../middlewares/authMiddleware.js";
import { sensitiveIpRateLimiter } from "../../middlewares/rateLimitMiddleware.js";
import exploreRouter from "./explore.js";

const mainRouter = Router();


mainRouter.use("/auth", sensitiveIpRateLimiter, authRouter);
mainRouter.use("/me", authenticateAccess, isActive, dashboardRouter);
mainRouter.use("/chat", authenticateAccess, isActive, chatRouter);
mainRouter.use("/explore", authenticateAccess, isActive, exploreRouter);
mainRouter.use("/governments", governmentRouter);
mainRouter.use("/specializations", specializationRouter);

export default mainRouter;
