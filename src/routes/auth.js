/**
 * @fileoverview Auth Routes - Authentication endpoints
 * @module routes/auth
 */

import { Router } from 'express';
import {
  requestOTP,
  verifyOTP,
  register,
  login,
  logout,
  generateAccessToken,
} from '../controllers/AuthControllers.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  checkSendOtpLimit,
  checkVerifyLimit,
} from '../middlewares/rateLimitMiddleware.js';
import {
  validateRequestOTP,
  validateVerifyOTP,
  validateRegister,
  validateLogin,
  validateGenerateAccessToken,
} from '../validators/auth.js';

import { sensitiveIpRateLimiter } from '../middlewares/rateLimitMiddleware.js';
const authRouter = Router();

authRouter.post(
  '/otp/request',
  validateRequestOTP,
  validateRequest,
  sensitiveIpRateLimiter,
  checkSendOtpLimit,
  requestOTP
);
authRouter.post(
  '/otp/verify',
  validateVerifyOTP,
  validateRequest,
  sensitiveIpRateLimiter,
  checkVerifyLimit,
  verifyOTP
);
authRouter.post(
  '/register',
  validateRegister,
  sensitiveIpRateLimiter,
  validateRequest,
  register
);
authRouter.post(
  '/login',
  validateLogin,
  sensitiveIpRateLimiter,
  validateRequest,
  login
);
authRouter.post('/logout', logout);
authRouter.post(
  '/access',
  validateGenerateAccessToken,
  validateRequest,
  generateAccessToken
);

export default authRouter;
