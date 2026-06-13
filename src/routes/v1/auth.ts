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
  RequestOTPRequestSchema,
  RequestOTPQuerySchema,
  RequestOTPParamsSchema,
  VerifyOTPRequestSchema,
  VerifyOTPQuerySchema,
  VerifyOTPParamsSchema,
  RegisterClientRequestSchema,
  RegisterClientQuerySchema,
  RegisterClientParamsSchema,
  RegisterWorkerRequestSchema,
  RegisterWorkerQuerySchema,
  RegisterWorkerParamsSchema,
  LoginRequestSchema,
  LoginQuerySchema,
  LoginParamsSchema,
  LogoutRequestSchema,
  LogoutQuerySchema,
  LogoutParamsSchema,
  GenerateAccessTokenRequestSchema,
  GenerateAccessTokenQuerySchema,
  GenerateAccessTokenParamsSchema,
  ReviewStatusRequestSchema,
  ReviewStatusQuerySchema,
  ReviewStatusParamsSchema,
  UpdateFcmTokenRequestSchema,
  UpdateFcmTokenQuerySchema,
  UpdateFcmTokenParamsSchema,
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
    schemas: { 
      body: RequestOTPRequestSchema,
      query: RequestOTPQuerySchema,
      params: RequestOTPParamsSchema,
    },
    inBetweenMiddlewares: [checkSendOtpLimit],
    handler: requestOTP,
  })
);

authRouter.post(
  '/otp/verify',
  createRoute({
    schemas: { 
      body: VerifyOTPRequestSchema,
      query: VerifyOTPQuerySchema,
      params: VerifyOTPParamsSchema,
    },
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
    schemas: { 
      body: RegisterClientRequestSchema,
      query: RegisterClientQuerySchema,
      params: RegisterClientParamsSchema,
    },
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
    schemas: { 
      body: RegisterWorkerRequestSchema,
      query: RegisterWorkerQuerySchema,
      params: RegisterWorkerParamsSchema,
    },
    handler: registerWorker,
  })
);

authRouter.post(
  '/login',
  authenticateLogin,
  createRoute({
    schemas: {
      body: LoginRequestSchema,
      query: LoginQuerySchema,
      params: LoginParamsSchema,
    },
    handler: login,
  })
);

authRouter.post(
  '/logout',
  authenticateAccess,
  isActive,
  createRoute({
    schemas: {
      body: LogoutRequestSchema,
      query: LogoutQuerySchema,
      params: LogoutParamsSchema,
    },
    handler: logout,
  })
);

authRouter.get(
  '/access',
  authenticateRefresh,
  isActive,
  createRoute({
    schemas: {
      body: GenerateAccessTokenRequestSchema,
      query: GenerateAccessTokenQuerySchema,
      params: GenerateAccessTokenParamsSchema,
    },
    handler: generateAccessToken,
  })
);

authRouter.get(
  '/review-status',
  authenticateAccess,
  createRoute({
    schemas: {
      body: ReviewStatusRequestSchema,
      query: ReviewStatusQuerySchema,
      params: ReviewStatusParamsSchema,
    },
    handler: reviewStatus,
  })
);

authRouter.patch(
  '/fcm-token',
  authenticateAccess,
  isActive,
  createRoute({
    schemas: { 
      body: UpdateFcmTokenRequestSchema,
      query: UpdateFcmTokenQuerySchema,
      params: UpdateFcmTokenParamsSchema,
    },
    handler: updateFcmToken,
  })
);

export default authRouter;
