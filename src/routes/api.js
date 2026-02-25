/**
 * @fileoverview API Routes - Main router combining all route modules
 * @module routes/api
 */

import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import govRouter from "./gov.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users", authenticate, usersRouter);
mainRouter.use("/gov", govRouter);

export default mainRouter;
