/**
 * @fileoverview User Routes - User management endpoints
 * @module routes/users
 */

import { Router } from "express";
import { updateBasicInfo, updateWorkerInfo, getMe } from "../controllers/UserControllers.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validateUpdateBasicInfo, validateUpdateWorkerInfo } from "../validators/user.js";

const usersRouter = Router();

usersRouter.put("/basic-info", validateUpdateBasicInfo, validateRequest, updateBasicInfo);
usersRouter.put("/worker-info", validateUpdateWorkerInfo, validateRequest, updateWorkerInfo);
usersRouter.get("/me", getMe);

export default usersRouter;
