/**
 * @fileoverview User Routes - User management endpoints
 * @module routes/users
 */

import { Router } from "express";
import { updateUser, updateWorkerProfile, updateClientProfile, getUser, getProfileImage, updateProfileImage, deleteProfileImage, createWorkerProfile, createClientProfile, getClientProfile, getWorkerProfile } from "../controllers/DashboardController.js";
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

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the authenticated user's profile information.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: User retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get("/me",
  validateRequest,
  getUser);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user
 *     description: Updates the authenticated user's basic info. All fields are optional.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put("/me",
  validateUpdateUser,
  validateRequest,
  updateUser);

/**
 * @swagger
 * /users/profile-image:
 *   get:
 *     summary: Get profile image
 *     description: Returns the authenticated user's profile image URL.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Profile image retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         profileImage:
 *                           type: string
 *                           nullable: true
 *                           example: 'https://res.cloudinary.com/.../image.jpg'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get("/profile-image",
  validateRequest,
  getProfileImage);

/**
 * @swagger
 * /users/profile-image:
 *   put:
 *     summary: Update profile image
 *     description: Uploads a new profile image for the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Profile image updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         profileImage:
 *                           type: string
 *                           example: 'https://res.cloudinary.com/.../image.jpg'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put("/profile-image",
  upload.single("file"),
  validateUpdateProfileImage,
  validateRequest,
  updateProfileImage);

/**
 * @swagger
 * /users/profile-image:
 *   delete:
 *     summary: Delete profile image
 *     description: Deletes the authenticated user's profile image. Workers cannot use this endpoint.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Profile image deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.delete("/profile-image",
  unAuthorizeWorker,
  validateRequest,
  deleteProfileImage);

/**
 * @swagger
 * /users/worker-profile:
 *   post:
 *     summary: Create worker profile
 *     description: |
 *       Creates a worker profile for the authenticated user (who must not already be a worker).
 *       Send as multipart/form-data with three required image files.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkerProfile'
 *     responses:
 *       200:
 *         description: Worker profile created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/WorkerProfile'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /users/worker-profile:
 *   get:
 *     summary: Get worker profile
 *     description: Returns the authenticated worker's profile. User must have a worker profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         workerProfile:
 *                           $ref: '#/components/schemas/WorkerProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get("/worker-profile",
  authorizeWorker,
  validateRequest,
  getWorkerProfile);

/**
 * @swagger
 * /users/worker-profile:
 *   put:
 *     summary: Update worker profile
 *     description: Updates the authenticated worker's profile. All fields are optional.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkerProfile'
 *     responses:
 *       200:
 *         description: Worker profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put("/worker-profile",
  authorizeWorker,
  validateUpdateWorkerProfile,
  validateRequest,
  updateWorkerProfile);

/**
 * @swagger
 * /users/client-profile:
 *   post:
 *     summary: Create client profile
 *     description: Creates a client profile for the authenticated user (who must not already be a client).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientProfile'
 *     responses:
 *       200:
 *         description: Client profile created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.post("/client-profile",
  unAuthorizeClient,
  validateRequest,
  createClientProfile);

/**
 * @swagger
 * /users/client-profile:
 *   get:
 *     summary: Get client profile
 *     description: Returns the authenticated client's profile. User must have a client profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Client profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get("/client-profile",
  authorizeClient,
  validateRequest,
  getClientProfile);

/**
 * @swagger
 * /users/client-profile:
 *   put:
 *     summary: Update client profile
 *     description: Updates the authenticated client's profile. All fields are optional.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClientProfile'
 *     responses:
 *       200:
 *         description: Client profile updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put("/client-profile",
  authorizeClient,
  validateRequest,
  updateClientProfile);

export default usersRouter;
