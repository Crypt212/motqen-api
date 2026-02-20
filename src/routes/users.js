/**
 * @fileoverview User Routes - User management endpoints
 * @module routes/users
 */

import { Router } from "express";
import { updateUser, updateWorkerProfile, updateClientProfile, getUser, getProfileImage, updateProfileImage, deleteProfileImage, createWorkerProfile, createClientProfile, getClientProfile, getWorkerProfile } from "../controllers/UserControllers.js";
import { authorizeWorker, unAuthorizeWorker } from "../middlewares/workerMiddleware.js";
import { authorizeClient, unAuthorizeClient } from "../middlewares/clientMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { updateUserValidators, updateWorkerProfileValidators, createWorkerProfileValidators, createClientProfileValidators, updateClientProfileValidators } from "../validators/user.js";
import upload from "../configs/multer.js";

const usersRouter = Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
usersRouter.get("/me", getUser);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserBasicInfo'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: updated user successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
usersRouter.put("/me", updateUserValidators, validateRequest, updateUser);

/**
 * @swagger
 * /api/users/profile-image:
 *   get:
 *     summary: Get user's profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile image retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: retrieved profile image successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     profileImage:
 *                       type: string
 *                       nullable: true
 *                       example: https://res.cloudinary.com/.../image.jpg
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
usersRouter.get("/profile-image", getProfileImage);

/**
 * @swagger
 * /api/users/profile-image:
 *   put:
 *     summary: Update user's profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (required)
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: updated profile image successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
usersRouter.put("/profile-image", upload.single("file"), updateProfileImage);

/**
 * @swagger
 * /api/users/profile-image:
 *   delete:
 *     summary: Delete user's profile image
 *     description: Workers cannot delete their profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: deleted profile image successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
usersRouter.delete("/profile-image", unAuthorizeWorker, deleteProfileImage);

// --------------- Worker --------------------------

/**
 * @swagger
 * /api/users/worker-profile:
 *   post:
 *     summary: Create worker profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - experienceYears
 *               - isInTeam
 *               - acceptsUrgentJobs
 *               - specializationNames
 *               - governmentNames
 *               - personal_image
 *               - id_image
 *               - personal_with_id_image
 *             properties:
 *               experienceYears:
 *                 type: integer
 *                 example: 5
 *                 description: Years of experience (0-50)
 *               isInTeam:
 *                 type: boolean
 *                 example: false
 *               acceptsUrgentJobs:
 *                 type: boolean
 *                 example: true
 *               specializationNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["plumbing", "electrical"]
 *               subSpecializationNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["installation", "repair"]
 *               governmentNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Cairo", "Giza"]
 *               personal_image:
 *                 type: string
 *                 format: binary
 *               id_image:
 *                 type: string
 *                 format: binary
 *               personal_with_id_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Worker profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: created worker profile successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
usersRouter.post("/worker-profile", unAuthorizeWorker, upload.fields([
  { name: "personal_image", maxCount: 1 },
  { name: "id_image", maxCount: 1 },
  { name: "personal_with_id_image", maxCount: 1 }
]), createWorkerProfileValidators, validateRequest, createWorkerProfile);

/**
 * @swagger
 * /api/users/worker-profile:
 *   get:
 *     summary: Get worker profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Worker profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: retrieved worker profile successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     workerProfile:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
usersRouter.get("/worker-profile", authorizeWorker, getWorkerProfile);

/**
 * @swagger
 * /api/users/worker-profile:
 *   put:
 *     summary: Update worker profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkerInfo'
 *     responses:
 *       200:
 *         description: Worker profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: updated worker profile successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
usersRouter.put("/worker-profile", authorizeWorker, updateWorkerProfileValidators, validateRequest, updateWorkerProfile);

// ----------------- Client -----------------------

/**
 * @swagger
 * /api/users/client-profile:
 *   post:
 *     summary: Create client profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Client profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: created client profile successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
usersRouter.post("/client-profile", unAuthorizeClient, createClientProfileValidators, validateRequest, createClientProfile);

/**
 * @swagger
 * /api/users/client-profile:
 *   get:
 *     summary: Get client profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: retrieved client profile successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     clientProfile:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
usersRouter.get("/client-profile", authorizeClient, getClientProfile);

/**
 * @swagger
 * /api/users/client-profile:
 *   put:
 *     summary: Update client profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: {}
 *     responses:
 *       200:
 *         description: Client profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: updated client profile successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
usersRouter.put("/client-profile", authorizeClient, updateClientProfileValidators, validateRequest, updateClientProfile);

export default usersRouter;
