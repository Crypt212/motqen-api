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

const authRouter = Router();

authRouter.post(
  '/otp/request',
 // sensitiveIpRateLimiter,
  checkSendOtpLimit,
  validateRequest,
  requestOTP
);

authRouter.post(
  '/otp/verify',
  //sensitiveIpRateLimiter,
  checkVerifyLimit,
  validateRequest,
  verifyOTP
);

authRouter.post(
  '/register-client',
  cloudinaryConfig,
  upload.single("personal_image"),
  //sensitiveIpRateLimiter,
  validateRequest,
  registerClient
);

authRouter.post(
  '/register-worker',
  cloudinaryConfig,
  upload.fields([
    { name: "personal_image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
    { name: "personal_with_id_image", maxCount: 1 }
  ]),
 // sensitiveIpRateLimiter,
  validateRequest,
  registerWorker
);

authRouter.post(
  '/login',
  //sensitiveIpRateLimiter,
  validateRequest,
  login
);

authRouter.post('/logout', logout);

authRouter.post(
  '/login',
  sensitiveIpRateLimiter,
  validateRequest,
  login
);

authRouter.post('/logout', logout);

authRouter.post(
  '/access',
  validateRequest,
  generateAccessToken
);

export default authRouter;
