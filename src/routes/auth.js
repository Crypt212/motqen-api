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
} from '../controllers/AuthControllers.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  checkSendOtpLimit,
  checkVerifyLimit,
} from '../middlewares/rateLimitMiddleware.js';

import { sensitiveIpRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import upload from '../configs/multer.js';
import cloudinaryConfig from '../middlewares/cloudinaryMiddleware.js';

// Import validators
import {
  validateRequestOTP,
  validateVerifyOTP,
  validateRegisterClient,
  validateRegisterWorker,
  validateLogin,
  validateGenerateAccessToken,
  validateLogout,
} from '../validators/auth.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const authRouter = Router();

authRouter.post(
  '/otp/request',
 // sensitiveIpRateLimiter,
  ...validateRequestOTP,
  // checkSendOtpLimit,
  validateRequest,
  requestOTP
);

authRouter.post(
  '/otp/verify',
//sensitiveIpRateLimiter,
  ...validateVerifyOTP,
  // checkVerifyLimit,
  validateRequest,
  verifyOTP
);

authRouter.post(
  '/register-client',
 // sensitiveIpRateLimiter,
  authenticate("register"),
  upload.single("personal_image"),
  ...validateRegisterClient,
  validateRequest,
  registerClient
);

authRouter.post(
  '/register-worker',
//  sensitiveIpRateLimiter,
  authenticate("register"),
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
  ...validateLogin,
  validateRequest,
  login
);

authRouter.post(
  '/logout',
  ...validateLogout,
  validateRequest,
  logout
);

authRouter.post(
  '/access',
  ...validateGenerateAccessToken,
  validateRequest,
  generateAccessToken
);

export default authRouter;
