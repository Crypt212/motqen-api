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
} from '../../controllers/AuthController.js';
import { checkSendOtpLimit, checkVerifyLimit } from '../../middlewares/rateLimitMiddleware.js';

import upload from '../../configs/multer.js';

import {
  RequestOTPSchema,
  VerifyOTPSchema,
  RegisterClientSchema,
  RegisterWorkerSchema,
} from '../../schemas/auth.js';
import {
  authenticateAccess,
  authenticateLogin,
  authenticateRefresh,
  authenticateRegister,
  isActive,
} from '../../middlewares/authMiddleware.js';
import { validateBody } from '../../middlewares/validateRequest.js';
import { parseMultipartJson } from 'src/middlewares/multipartParseMiddleware.js';

const authRouter = Router();

authRouter.post('/otp/request', validateBody(RequestOTPSchema), checkSendOtpLimit, requestOTP);

authRouter.post('/otp/verify', validateBody(VerifyOTPSchema), checkVerifyLimit, verifyOTP);

authRouter.post(
  '/register-client',
  upload.single('personal_image'),
  authenticateRegister,
  parseMultipartJson(['userData', 'clientProfile']),
  validateBody(RegisterClientSchema),
  registerClient
);

authRouter.post(
  '/register-worker',
  upload.fields([
    { name: 'personal_image', maxCount: 1 },
    { name: 'id_image', maxCount: 1 },
    { name: 'personal_with_id_image', maxCount: 1 },
  ]),
  authenticateRegister,
  parseMultipartJson(['userData', 'workerProfile']),
  validateBody(RegisterWorkerSchema),
  registerWorker
);

authRouter.post('/login', authenticateLogin, login);

authRouter.post('/logout', authenticateAccess, isActive, logout);

authRouter.get('/access', authenticateRefresh, isActive, generateAccessToken);

authRouter.get('/review-status', authenticateAccess, reviewStatus);

export default authRouter;
