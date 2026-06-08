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
} from '../../schemas/requests/auth.request.js';
import { z } from 'zod';
import {
  authenticateAccess,
  authenticateLogin,
  authenticateRefresh,
  authenticateRegister,
  isActive,
} from '../../middlewares/authMiddleware.js';
// import { validateBody } from 'twilio/lib/webhooks/webhooks.js';
import { validateBody } from '../../middlewares/validateRequest.js';
import { parseFormDataJson } from 'src/middlewares/multiformParserMiddleware.js';

const authRouter = Router();

authRouter.post('/otp/request', validateBody(RequestOTPSchema), checkSendOtpLimit, requestOTP);

authRouter.post('/otp/verify', validateBody(VerifyOTPSchema), checkVerifyLimit, verifyOTP);

authRouter.post(
  '/register-client',
  upload.single('personal_image'),
  authenticateRegister,
  parseFormDataJson('userData'),
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
  parseFormDataJson('userData'),
  parseFormDataJson('workerProfile'),
  validateBody(RegisterWorkerSchema),
  registerWorker
);

authRouter.post('/login', authenticateLogin, login);

authRouter.post('/logout', authenticateAccess, isActive, logout);

authRouter.get('/access', authenticateRefresh, isActive, generateAccessToken);

authRouter.get('/review-status', authenticateAccess, reviewStatus);

const FcmTokenSchema = z.object({
  fcmToken: z.string().min(1),
});

authRouter.patch(
  '/fcm-token',
  authenticateAccess,
  isActive,
  validateBody(FcmTokenSchema),
  updateFcmToken
);
export default authRouter;
