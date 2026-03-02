/**
 * @fileoverview Client Routes - Client-related endpoints
 * @module routes/client
 */

import { Router } from 'express';
import upload from '../configs/multer.js';
import { getMe, updateProfileImage } from '../controllers/ClientController.js';
import { authenticateAccess } from '../middlewares/authMiddleware.js';

const clientRouter = Router();

/**
 * GET /client/me
 * Retrieve authenticated client's profile
 */
clientRouter.get('/me', authenticateAccess, getMe);

/**
 * POST /client/me/profile-image
 * Update client's profile image
 */
clientRouter.post('/me/profile-image', authenticateAccess, upload.single('profileImage'), updateProfileImage);

export default clientRouter;
