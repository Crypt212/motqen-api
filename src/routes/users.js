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

// Import validators
import {
  validateUpdateUser,
  validateCreateWorkerProfile,
  validateUpdateWorkerProfile,
  validateUpdateProfileImage,
} from "../validators/user.js";

const usersRouter = Router();

usersRouter.get("/me",
  validateRequest,
  getUser);

usersRouter.put("/me",
  validateUpdateUser,
  validateRequest,
  updateUser);

usersRouter.get("/profile-image",
  validateRequest,
  getProfileImage);

usersRouter.put("/profile-image",
  upload.single("file"),
  validateUpdateProfileImage,
  validateRequest,
  updateProfileImage);

usersRouter.delete("/profile-image",
  unAuthorizeWorker,
  validateRequest,
  deleteProfileImage);

usersRouter.post("/worker-profile",
  unAuthorizeWorker,
  upload.fields([
    { name: "personal_image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
    { name: "personal_with_id_image", maxCount: 1 }
  ]),
  validateCreateWorkerProfile,
  validateRequest,
  createWorkerProfile);

usersRouter.get("/worker-profile",
  authorizeWorker,
  validateRequest,
  getWorkerProfile);

usersRouter.put("/worker-profile",
  authorizeWorker,
  validateUpdateWorkerProfile,
  validateRequest,
  updateWorkerProfile);

usersRouter.post("/client-profile",
  unAuthorizeClient,
  validateRequest,
  createClientProfile);

usersRouter.get("/client-profile",
  authorizeClient,
  validateRequest,
  getClientProfile);

usersRouter.put("/client-profile",
  authorizeClient,
  validateRequest,
  updateClientProfile);

export default usersRouter;
