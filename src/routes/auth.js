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
import {
  requestOTPValidator,
  verifyOTPValidator,
  registerClientValidator,
  registerWorkerValidator,
  loginValidator,
  generateAccessTokenValidator,
} from '../validators/auth.js';

const authRouter = Router();

/**
 * @swagger
 * /auth/otp/request:
 *   post:
 *     summary: Request OTP
 *     description: Send a one-time password to the user's phone number for authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *           example:
 *             phoneNumber: "+201234567890"
 *             method: "SMS"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "OTP sent successfully"
 *               data:
 *                 phoneNumber: "+201234567890"
 *                 expiresIn: 300
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/otp/request',
  sensitiveIpRateLimiter,
  checkSendOtpLimit,
  requestOTPValidator,
  validateRequest,
  requestOTP
);

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     description: Verify the one-time password sent to the user's phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerify'
 *           example:
 *             phoneNumber: "+201234567890"
 *             otp: "123456"
 *             method: "SMS"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "OTP verified successfully"
 *               data:
 *                 registerToken: "reg_token_xxx"
 *                 loginToken: "login_token_xxx"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "Invalid or expired OTP"
 *                 code: "INVALID_OTP"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/otp/verify',
  sensitiveIpRateLimiter,
  checkVerifyLimit,
  verifyOTPValidator,
  validateRequest,
  verifyOTP
);

/**
 * @swagger
 * /auth/register-client:
 *   post:
 *     summary: Register Client
 *     description: Register a new client user with their personal information
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterClient'
 *           example:
 *             registerToken: "reg_token_xxx"
 *             firstName: "أحمد"
 *             lastName: "محمد"
 *             government: "123e4567-e89b-12d3-a456-426614174000"
 *             city: "123e4567-e89b-12d3-a456-426614174001"
 *             bio: "مستخدم جديد يبحث عن خدمات"
 *     responses:
 *       201:
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Client registered successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   firstName: "أحمد"
 *                   lastName: "محمد"
 *                   role: "USER"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/register-client',
  sensitiveIpRateLimiter,
  registerClientValidator,
  validateRequest,
  registerClient
);

/**
 * @swagger
 * /auth/register-worker:
 *   post:
 *     summary: Register Worker
 *     description: Register a new worker with their professional information and specializations
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterWorker'
 *           example:
 *             registerToken: "reg_token_xxx"
 *             firstName: "أحمد"
 *             lastName: "محمد"
 *             government: "123e4567-e89b-12d3-a456-426614174000"
 *             city: "123e4567-e89b-12d3-a456-426614174001"
 *             bio: "فني خبرة 10 سنوات في مجال السباكة"
 *             experienceYears: 10
 *             isInTeam: false
 *             acceptsUrgentJobs: true
 *             specializationNames: ["سباكة", "تبريد وتكييف"]
 *             subSpecializationNames: ["تركيب", "صيانة", "إصلاح"]
 *             workGovernmentNames: ["القاهرة", "الجيزة", "الإسكندرية"]
 *     responses:
 *       201:
 *         description: Worker registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Worker registered successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   firstName: "أحمد"
 *                   lastName: "محمد"
 *                   role: "WORKER"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/register-worker',
  sensitiveIpRateLimiter,
  registerWorkerValidator,
  validateRequest,
  registerWorker
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate user with login token and generate session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *           example:
 *             loginToken: "login_token_xxx"
 *             deviceFingerprint: "fp_abc123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   phoneNumber: "+201234567890"
 *                   role: "USER"
 *                 tokens:
 *                   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/login',
  sensitiveIpRateLimiter,
  loginValidator,
  validateRequest,
  login
);
authRouter.post('/logout', logout);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logout user and invalidate current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Logout successful"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post('/logout', logout);

/**
 * @swagger
 * /auth/access:
 *   post:
 *     summary: Generate Access Token
 *     description: Generate new access token using refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-device-fingerprint
 *         required: true
 *         schema:
 *           type: string
 *         example: "fp_abc123"
 *         description: Device fingerprint for security
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Access token generated successfully"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/access',
  generateAccessTokenValidator,
  validateRequest,
  generateAccessToken
);

export default authRouter;
