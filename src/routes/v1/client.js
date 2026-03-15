/**
 * @fileoverview Client Routes - Client-related endpoints
 * @module routes/client
 */

import { Router } from 'express';
import upload from '../../configs/multer.js';
import { getMe, updateProfileImage } from '../../controllers/ClientController.js';
import { authenticateAccess } from '../../middlewares/authMiddleware.js';

const clientRouter = Router();

/**
 * @swagger
 * /client/me:
 *   get:
 *     summary: Get Client Profile
 *     description: |
 *       Retrieves the authenticated client's profile information including:
 *       - Personal details (name, phone, etc.)
 *       - Client-specific information (address, address notes)
 *       - Profile image URL
 *
 *       Requires valid access token from successful login.
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Client profile retrieved successfully
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
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         phoneNumber:
 *                           type: string
 *                           example: "+201001234567"
 *                         firstName:
 *                           type: string
 *                         middleName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         profileImageUrl:
 *                           type: string
 *                           nullable: true
 *                         clientProfile:
 *                           type: object
 *                           properties:
 *                             address:
 *                               type: string
 *                               nullable: true
 *                             addressNotes:
 *                               type: string
 *                               nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
clientRouter.get('/me', authenticateAccess, getMe);

/**
 * @swagger
 * /client/me/profile-image:
 *   post:
 *     summary: Update Client Profile Image
 *     description: |
 *       Updates the authenticated client's profile image.
 *       Image file is uploaded to Cloudinary and the URL is stored in the database.
 *
 *       Supported formats: JPEG, PNG, WebP
 *       Max file size: 5MB (configured in multer)
 *     tags: [Client]
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
 *             required: [profileImage]
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPEG, PNG, or WebP)
 *     responses:
 *       200:
 *         description: Profile image updated successfully
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
 *                         profileImageUrl:
 *                           type: string
 *                           example: "https://res.cloudinary.com/..."
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
clientRouter.post('/me/profile-image', authenticateAccess, upload.single('profileImage'), updateProfileImage);

export default clientRouter;
