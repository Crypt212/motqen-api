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
// import { validateBody } from 'twilio/lib/webhooks/webhooks.js';
import { validateBody } from '../../middlewares/validateRequest.js';

const authRouter = Router();

/**
 * @swagger
 * /auth/otp/request:
 *   post:
 *     summary: Request OTP
 *     description: Sends a one-time password to the provided Egyptian phone number via SMS or WhatsApp.
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         phoneNumber:
 *                           type: string
 *                           example: '+201234567890'
 *                         method:
 *                           type: string
 *                           example: 'SMS'
 *                         cooldown:
 *                           type: integer
 *                           example: 60
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post('/otp/request', validateBody(RequestOTPSchema), checkSendOtpLimit, requestOTP);
/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP and returns either a login token (existing user) or a register token (new user).
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerify'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         tokenType:
 *                           type: string
 *                           enum: [login, register]
 *                           example: 'login'
 *                         token:
 *                           type: string
 *                           example: 'eyJhbGciOiJI...'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post('/otp/verify', validateBody(VerifyOTPSchema), checkVerifyLimit, verifyOTP);
/**
 * @swagger
 * /auth/register-client:
 *   post:
 *     summary: Register a new client
 *     description: |
 *       Registers a new client user. Requires a **register token** in the Authorization header
 *       (obtained from OTP verify when the phone number is new).
 *
 *       Send as `multipart/form-data` with:
 *       - `userData` — JSON string with user info (includes location with long/lat)
 *       - `personal_image` — optional profile image file
 *
 *       **Register token:** Use the token returned by `/auth/otp/verify` (tokenType: "register").
 *       Set it as `Bearer <token>` in the Authorization header.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [userData]
 *             properties:
 *               personal_image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (optional, jpeg/png/webp)
 *               userData:
 *                 type: string
 *                 default: '{"firstName":"أحمد","middleName":"علي","lastName":"محمد","location":{"governmentId":"123e4567-e89b-12d3-a456-426614000","cityId":"123e4567-e89b-12d3-a456-426614001","address":"123 شارع الرئيسي، المنصورة","addressNotes":"بجوار المسجد الكبير","long":31.2357,"lat":30.0444}}'
 *                 description: |
 *                   JSON string containing:
 *                   - `firstName` (string, required, 2-50 chars)
 *                   - `middleName` (string, required, 2-50 chars)
 *                   - `lastName` (string, required, 2-50 chars)
 *                   - `location` (object, required) - contains:
 *                     - `governmentId` (UUID, required)
 *                     - `cityId` (UUID, required)
 *                     - `address` (string, required)
 *                     - `addressNotes` (string, optional)
 *                     - `long` (number, required, -180 to 180)
 *                     - `lat` (number, required, -90 to 90)
 *     responses:
 *       200:
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/register-client',
  upload.single('personal_image'),
  authenticateRegister,
  validateBody(RegisterClientSchema),
  registerClient
);
/**
 * @swagger
 * /auth/register-worker:
 *   post:
 *     summary: Register a new worker
 *     description: |
 *       Registers a new worker user. Requires a **register token** in the Authorization header
 *       (obtained from OTP verify when the phone number is new).
 *
 *       Send as `multipart/form-data` with:
 *       - `userData` — JSON string with user info (includes location with long/lat)
 *       - `workerProfile` — JSON string with worker profile data (specializations, experience, etc.)
 *       - `personal_image` — personal photo (required)
 *       - `id_image` — national ID image (required)
 *       - `personal_with_id_image` — selfie holding national ID (required)
 *
 *       **Register token:** Use the token returned by `/auth/otp/verify` (tokenType: "register").
 *       Set it as `Bearer <token>` in the Authorization header.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [userData, workerProfile, personal_image, id_image, personal_with_id_image]
 *             properties:
 *               personal_image:
 *                 type: string
 *                 format: binary
 *                 description: Personal photo (required, jpeg/png/webp)
 *               id_image:
 *                 type: string
 *                 format: binary
 *                 description: National ID document image (required)
 *               personal_with_id_image:
 *                 type: string
 *                 format: binary
 *                 description: Selfie holding national ID (required)
 *               userData:
 *                 type: string
 *                 default: '{"firstName":"أحمد","middleName":"علي","lastName":"محمد","location":{"governmentId":"123e4567-e89b-12d3-a456-426614000","cityId":"123e4567-e89b-12d3-a456-426614001","address":"123 شارع الرئيسي، المنصورة","addressNotes":"بجوار المسجد الكبير","long":31.2357,"lat":30.0444}}'
 *                 description: |
 *                   JSON string containing:
 *                   - `firstName` (string, required, 2-50 chars)
 *                   - `middleName` (string, required, 2-50 chars)
 *                   - `lastName` (string, required, 2-50 chars)
 *                   - `location` (object, required) - contains:
 *                     - `governmentId` (UUID, required)
 *                     - `cityId` (UUID, required)
 *                     - `address` (string, required)
 *                     - `addressNotes` (string, optional)
 *                     - `long` (number, required, -180 to 180)
 *                     - `lat` (number, required, -90 to 90)
 *               workerProfile:
 *                 type: string
 *                 default: '{"experienceYears":5,"isInTeam":false,"acceptsUrgentJobs":true,"specializationsTree":[{"mainId":"123e4567-e89b-12d3-a456-426614174000","subIds":["123e4567-e89b-12d3-a456-426614174001"]}],"workGovernmentIds":["123e4567-e89b-12d3-a456-426614174000"]}'
 *                 description: |
 *                   JSON string containing worker profile data:
 *                   - `experienceYears` (integer, required, 0-50)
 *                   - `isInTeam` (boolean, required)
 *                   - `acceptsUrgentJobs` (boolean, required)
 *                   - `specializationsTree` (array, required) — each item: `{ mainId: "uuid", subIds: ["uuid"] }`
 *                   - `workGovernmentIds` (array of UUIDs, required)
 *     responses:
 *       200:
 *         description: Worker registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         workerProfile:
 *                           $ref: '#/components/schemas/WorkerProfile'
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post(
  '/register-worker',
  upload.fields([
    { name: 'personal_image', maxCount: 1 },
    { name: 'id_image', maxCount: 1 },
    { name: 'personal_with_id_image', maxCount: 1 },
  ]),
  authenticateRegister,
  validateBody(RegisterWorkerSchema),
  registerWorker
);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticates a user and returns access and refresh tokens.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         refreshToken:
 *                           type: string
 *                         accessToken:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post('/login', authenticateLogin, login);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     description: Revokes the user's current session. Requires a valid **access token**.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       nullable: true
 *                       example: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.post('/logout', authenticateAccess, isActive, logout);
/**
 * @swagger
 * /auth/access:
 *   get:
 *     summary: Refresh access token
 *     description: |
 *       Generates a new access token using a valid **refresh token** in the Authorization header.
 *       Use the refresh token from `/auth/login` as `Bearer <token>`.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Access token generated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.get('/access', authenticateRefresh, isActive, generateAccessToken);
/**
 * @swagger
 * /auth/review-status:
 *   get:
 *     summary: Check review / approval status
 *     description: Returns whether the authenticated user (worker) has been approved by an admin. Requires **access token**.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Approval status returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRouter.get('/review-status', authenticateAccess, reviewStatus);
export default authRouter;
