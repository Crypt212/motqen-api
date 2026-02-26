/**
 * @fileoverview Auth Routes - Authentication endpoints
 * @module routes/auth
 */

import { Router } from 'express';
import {
  requestOTP,
  verifyOTP,
  registerClient,
  registerWorker,
  login,
  logout,
  generateAccessToken,
  reviewStatus,
} from '../controllers/AuthController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  checkSendOtpLimit,
  checkVerifyLimit,
} from '../middlewares/rateLimitMiddleware.js';

import upload from '../configs/multer.js';

import {
  validateRequestOTP,
  validateVerifyOTP,
  validateRegisterClient,
  validateRegisterWorker,
  validateLogin,
  validateGenerateAccessToken,
  validateLogout,
  validateReviewStatus,
} from '../validators/auth.js';
import { authenticateActive, authenticateTokens } from '../middlewares/authMiddleware.js';

const authRouter = Router();

authRouter.post(
  '/otp/request',
  ...validateRequestOTP,
  validateRequest,
  checkSendOtpLimit,
  requestOTP
);

authRouter.post(
  '/otp/verify',
  ...validateVerifyOTP,
  validateRequest,
  checkVerifyLimit,
  verifyOTP
);

authRouter.post(
  '/register-client',
  upload.single("personal_image"),
  ...validateRegisterClient,
  validateRequest,
  authenticateTokens(["register"]),
  registerClient
);

authRouter.post(
  '/register-worker',
  upload.fields([
    { name: "personal_image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
    { name: "personal_with_id_image", maxCount: 1 }
  ]),
  ...validateRegisterWorker,
  validateRequest,
  authenticateTokens(["register"]),
  registerWorker
);

authRouter.post(
  '/login',
  ...validateLogin,
  validateRequest,
  authenticateTokens(["login"]),
  login
);

authRouter.post(
  '/logout',
  ...validateLogout,
  validateRequest,
  authenticateTokens(["access"]),
  authenticateActive,
  logout
);

authRouter.get(
  '/access',
  ...validateGenerateAccessToken,
  validateRequest,
  authenticateTokens(["refresh"]),
  authenticateActive,
  generateAccessToken
);

authRouter.get(
  '/review-status',
  ...validateReviewStatus,
  validateRequest,
  authenticateTokens(["access"]),
  reviewStatus
);
export default authRouter;
