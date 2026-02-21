/**
 * @fileoverview User Routes - User management endpoints
 * @module routes/users
 */

import { Router } from "express";
import { updateUser, updateWorkerProfile, updateClientProfile, getUser, getProfileImage, updateProfileImage, deleteProfileImage, createWorkerProfile, createClientProfile, getClientProfile, getWorkerProfile } from "../controllers/UserControllers.js";
import { authorizeWorker, unAuthorizeWorker } from "../middlewares/workerMiddleware.js";
import { authorizeClient, unAuthorizeClient } from "../middlewares/clientMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import upload from "../configs/multer.js";

const usersRouter = Router();

usersRouter.get("/me", getUser);
usersRouter.put("/me",
  validateRequest,
  updateUser);

usersRouter.get("/profile-image", getProfileImage);
usersRouter.put("/profile-image", upload.single("file"), updateProfileImage);
usersRouter.delete("/profile-image", unAuthorizeWorker, deleteProfileImage);

usersRouter.post("/worker-profile", unAuthorizeWorker, upload.fields([
  { name: "personal_image", maxCount: 1 },
  { name: "id_image", maxCount: 1 },
  { name: "personal_with_id_image", maxCount: 1 }
]), validateRequest, createWorkerProfile);
usersRouter.get("/worker-profile", authorizeWorker, getWorkerProfile);
usersRouter.put("/worker-profile", authorizeWorker, validateRequest, updateWorkerProfile);

usersRouter.post("/client-profile", unAuthorizeClient, validateRequest, createClientProfile);
usersRouter.get("/client-profile", authorizeClient, getClientProfile);
usersRouter.put("/client-profile", authorizeClient, validateRequest, updateClientProfile);

export default usersRouter;
