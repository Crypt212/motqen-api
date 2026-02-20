/**
 * @fileoverview User Routes - User management endpoints
 * @module routes/users
 */

import { Router } from "express";
import { updateUser, updateWorkerInfo, getMe } from "../controllers/UserControllers.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { updateUserValidator, updateWorkerInfoValidator } from "../validators/user.js";

const usersRouter = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get Current User
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "User profile retrieved successfully"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 firstName: "أحمد"
 *                 lastName: "محمد"
 *                 phoneNumber: "+201234567890"
 *                 role: "USER"
 *                 government: "القاهرة"
 *                 city: "الشيخ زايد"
 *                 bio: "مستخدم جديد"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get("/me", getMe);

/**
 * @swagger
 * /users/basic-info:
 *   put:
 *     summary: Update Basic Info
 *     description: Update the authenticated user's basic profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserBasicInfo'
 *           example:
 *             firstName: "أحمد"
 *             lastName: "علي"
 *             government: "123e4567-e89b-12d3-a456-426614174000"
 *             city: "123e4567-e89b-12d3-a456-426614174001"
 *             bio: "مستخدم نشط يبحث عن أفضل الخدمات"
 *     responses:
 *       200:
 *         description: User basic info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "User basic info updated successfully"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 firstName: "أحمد"
 *                 lastName: "علي"
 *                 government: "القاهرة"
 *                 city: "الشيخ زايد"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put("/basic-info", updateUserValidator, validateRequest, updateUser);

/**
 * @swagger
 * /users/worker-info:
 *   put:
 *     summary: Update Worker Info
 *     description: Update the authenticated worker's professional information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkerInfo'
 *           example:
 *             experienceYears: 8
 *             isInTeam: true
 *             acceptsUrgentJobs: false
 *     responses:
 *       200:
 *         description: Worker info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Worker info updated successfully"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 experienceYears: 8
 *                 isInTeam: true
 *                 acceptsUrgentJobs: false
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put("/worker-info", updateWorkerInfoValidator, validateRequest, updateWorkerInfo);

export default usersRouter;
