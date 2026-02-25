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

import { sensitiveIpRateLimiter } from '../middlewares/rateLimitMiddleware.js';
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
import { authenticate, authenticateLogin, authenticateRegister } from '../middlewares/authMiddleware.js';

const authRouter = Router();

authRouter.post(
  '/otp/request',
  sensitiveIpRateLimiter,
  ...validateRequestOTP,
  checkSendOtpLimit,
  validateRequest,
  requestOTP
);

authRouter.post(
  '/otp/verify',
  sensitiveIpRateLimiter,
  ...validateVerifyOTP,
  checkVerifyLimit,
  validateRequest,
  verifyOTP
);

authRouter.post(
  '/register-client',
  sensitiveIpRateLimiter,
  authenticateRegister,
  upload.single("personal_image"),
  ...validateRegisterClient,
  validateRequest,
  registerClient
);

authRouter.post(
  '/register-worker',
  sensitiveIpRateLimiter,
  authenticateRegister,
  upload.fields([
    { name: "personal_image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
    { name: "personal_with_id_image", maxCount: 1 }
  ]),
  ...validateRegisterWorker,
  validateRequest,
  registerWorker
);

authRouter.post(
  '/login',
  sensitiveIpRateLimiter,
  authenticateLogin,
  ...validateLogin,
  validateRequest,
  login
);

authRouter.post(
  '/logout',
  authenticate,
  ...validateLogout,
  validateRequest,
  logout
);

authRouter.get(
  '/access',
  authenticate,
  ...validateGenerateAccessToken,
  validateRequest,
  generateAccessToken
);

authRouter.get(
  '/review-status',
  authenticate,
  ...validateReviewStatus,
  validateRequest,
  reviewStatus
);
export default authRouter;
