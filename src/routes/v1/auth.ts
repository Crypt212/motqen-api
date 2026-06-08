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
  updateFcmToken,
} from '../../controllers/AuthController.js';
import { checkSendOtpLimit, checkVerifyLimit } from '../../middlewares/rateLimitMiddleware.js';

import upload from '../../configs/multer.js';

import {
  RequestOTPSchema,
  VerifyOTPSchema,
  RegisterClientSchema,
  RegisterWorkerSchema,
  FcmTokenSchema,
} from '../../schemas/requests/auth.request.js';
import {
  authenticateAccess,
  authenticateLogin,
  authenticateRefresh,
  authenticateRegister,
  isActive,
} from '../../middlewares/authMiddleware.js';
import { parseFormDataJson } from 'src/middlewares/multiformParserMiddleware.js';
import { createRoute } from 'src/types/asyncHandler.js';

const authRouter = Router();

authRouter.post(
  '/otp/request',
  createRoute({
    schemas: { body: RequestOTPSchema },
    inBetweenMiddlewares: [checkSendOtpLimit],
    handler: requestOTP,
  })
);

authRouter.post(
  '/otp/verify',
  createRoute({
    schemas: { body: VerifyOTPSchema },
    inBetweenMiddlewares: [checkVerifyLimit],
    handler: verifyOTP,
  })
);

authRouter.post(
  '/register-client',
  upload.single('personal_image'),
  authenticateRegister,
  parseFormDataJson('userData'),
  createRoute({
    schemas: { body: RegisterClientSchema },
    handler: registerClient,
  })
);

authRouter.post(
  '/register-worker',
  upload.fields([
    { name: 'personal_image', maxCount: 1 },
    { name: 'id_image', maxCount: 1 },
    { name: 'personal_with_id_image', maxCount: 1 },
  ]),
  authenticateRegister,
  parseFormDataJson('userData'),
  parseFormDataJson('workerProfile'),
  createRoute({
    schemas: { body: RegisterWorkerSchema },
    handler: registerWorker,
  })
);

authRouter.post('/login', authenticateLogin, login);

authRouter.post('/logout', authenticateAccess, isActive, logout);

authRouter.get('/access', authenticateRefresh, isActive, generateAccessToken);

authRouter.get('/review-status', authenticateAccess, reviewStatus);

authRouter.patch(
  '/fcm-token',
  authenticateAccess,
  isActive,
  createRoute({
    schemas: { body: FcmTokenSchema },
    handler: updateFcmToken,
  })
);

export default authRouter;
