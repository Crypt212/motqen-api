/**
 * @fileoverview API Routes - Main router combining all route modules
 * @module routes/api
 */

import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import governmentRouter from "./governments.js";
import specializationRouter from "./specializations.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users", authenticate, usersRouter);
mainRouter.use("/governments", governmentRouter);
mainRouter.use("/specializations", specializationRouter);

export default mainRouter;
