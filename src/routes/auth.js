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
 *     description: |
 *       Send a one-time password to the user's phone number for authentication.
 *
 *       **Rate limiting:** This endpoint enforces per-phone and per-device send limits
 *       with escalating cooldowns. The `x-device-fingerprint` header is required to
 *       track device-level abuse. On success the response includes a `cooldown` value
 *       (in seconds) indicating how long the user must wait before requesting another OTP.
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-device-fingerprint
 *         required: true
 *         schema:
 *           type: string
 *         example: "fp_abc123"
 *         description: Device fingerprint or device ID for rate-limiting
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
 *               status: "success"
 *               message: "OTP sent successfully"
 *               data:
 *                 phoneNumber: "+201234567890"
 *                 method: "SMS"
 *                 cooldown: 60
 *       400:
 *         description: Validation failed or missing device fingerprint
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       message: "Please provide a valid Egyptian phone number"
 *               missingFingerprint:
 *                 summary: Missing device fingerprint
 *                 value:
 *                   status: "fail"
 *                   message: "X-Device-Fingerprint header is required"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/otp/request',
 // sensitiveIpRateLimiter,
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
 *     description: |
 *       Verify the one-time password sent to the user's phone number.
 *
 *       On success, returns either a `login` token (if the user exists) or a `register`
 *       token (if the user is new). The `tokenType` field indicates which one was issued.
 *
 *       On failure (wrong OTP), the response includes `remainingAttempts` and
 *       `requestNewOtp` to indicate whether the user should request a fresh OTP.
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
 *         description: OTP verified successfully — returns a login or register token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               existingUser:
 *                 summary: Existing user — login token returned
 *                 value:
 *                   status: "success"
 *                   message: "OTP verified successfully"
 *                   data:
 *                     phoneNumber: "+201234567890"
 *                     tokenType: "login"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newUser:
 *                 summary: New user — register token returned
 *                 value:
 *                   status: "success"
 *                   message: "OTP verified successfully"
 *                   data:
 *                     phoneNumber: "+201234567890"
 *                     tokenType: "register"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid/expired OTP or validation error
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               invalidOtp:
 *                 summary: Wrong or expired OTP
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid or expired OTP"
 *                   errors:
 *                     remainingAttempts: 2
 *                     requestNewOtp: false
 *               noMoreAttempts:
 *                 summary: All attempts exhausted — must request new OTP
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid or expired OTP"
 *                   errors:
 *                     remainingAttempts: 0
 *                     requestNewOtp: true
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       message: "OTP must be 4-6 digits"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/otp/verify',
  //sensitiveIpRateLimiter,
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
 *     description: |
 *       Register a new client user with personal information.
 *
 *       Requires a valid `registerToken` obtained from the OTP verification step
 *       (only issued when the phone number is not yet registered).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterClient'
 *           example:
 *             registerToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             firstName: "أحمد"
 *             lastName: "محمد"
 *             government: "123e4567-e89b-12d3-a456-426614174000"
 *             city: "123e4567-e89b-12d3-a456-426614174001"
 *             bio: "مستخدم جديد يبحث عن خدمات"
 *     responses:
 *       200:
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "success"
 *               message: "User created successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   phoneNumber: "+201234567890"
 *                   firstName: "أحمد"
 *                   lastName: "محمد"
 *                   role: "USER"
 *                 clientProfile:
 *                   id: "223e4567-e89b-12d3-a456-426614174000"
 *                   userId: "123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Validation failed or invalid/expired register token
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       message: "First name must be between 2 and 50 characters"
 *               invalidToken:
 *                 summary: Invalid or expired register token
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid or expired token"
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/register-client',
  //sensitiveIpRateLimiter,
  registerClientValidator,
  validateRequest,
  registerClient
);

/**
 * @swagger
 * /auth/register-worker:
 *   post:
 *     summary: Register Worker
 *     description: |
 *       Register a new worker with professional information and specializations.
 *
 *       Requires a valid `registerToken` obtained from the OTP verification step
 *       (only issued when the phone number is not yet registered).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterWorker'
 *           example:
 *             registerToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *       200:
 *         description: Worker registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "success"
 *               message: "User created successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   phoneNumber: "+201234567890"
 *                   firstName: "أحمد"
 *                   lastName: "محمد"
 *                   role: "WORKER"
 *                 workerProfile:
 *                   id: "323e4567-e89b-12d3-a456-426614174000"
 *                   userId: "123e4567-e89b-12d3-a456-426614174000"
 *                   experienceYears: 10
 *                   isInTeam: false
 *                   acceptsUrgentJobs: true
 *       400:
 *         description: Validation failed or invalid/expired register token
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       message: "Experience years must be between 0 and 50"
 *                     - type: "field"
 *                       message: "Specialization names must be a non-empty array"
 *               invalidToken:
 *                 summary: Invalid or expired register token
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid or expired token"
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/register-worker',
 // sensitiveIpRateLimiter,
  registerWorkerValidator,
  validateRequest,
  registerWorker
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: |
 *       Authenticate a registered user with a login token and create a new session.
 *
 *       The `loginToken` is obtained from the OTP verification step (only issued when
 *       the phone number is already registered). A refresh token is returned which
 *       should be used with the `/auth/access` endpoint to generate access tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *           example:
 *             loginToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             deviceFingerprint: "fp_abc123"
 *     responses:
 *       200:
 *         description: Login successful — returns user data and refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "success"
 *               message: "login successfully"
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   phoneNumber: "+201234567890"
 *                   firstName: "أحمد"
 *                   lastName: "محمد"
 *                   role: "USER"
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation failed or invalid/expired login token
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - type: "field"
 *                       message: "Login token is required"
 *               invalidToken:
 *                 summary: Invalid or expired login token
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid or expired token"
 *       404:
 *         description: User account not found (may have been deleted)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "User not found"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/login',
  //sensitiveIpRateLimiter,
  loginValidator,
  validateRequest,
  login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: |
 *       Logout the current user and invalidate the session associated with the
 *       given device fingerprint.
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
 *         description: Device fingerprint to identify which session to revoke
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "success"
 *               message: "Logged out successfully"
 *               data: null
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
 *     description: |
 *       Generate a new short-lived access token using a valid refresh token.
 *
 *       The refresh token must be passed in the `Authorization` header as a Bearer token,
 *       and the `x-device-fingerprint` header must match the device that created the session.
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
 *         description: Device fingerprint for session validation
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "success"
 *               message: "Access token generated successfully"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation failed (missing headers)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 - type: "field"
 *                   message: "Device fingerprint header is required"
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Invalid or expired token"
 *       403:
 *         description: Session mismatch — device fingerprint does not match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Session not found or revoked"
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
