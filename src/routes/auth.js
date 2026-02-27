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
} from '../controllers/AuthController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  checkSendOtpLimit,
  checkVerifyLimit,
} from '../middlewares/rateLimitMiddleware.js';

import upload from '../configs/multer.js';

import {
  validateRequestOTP,
  validateVerifyOTP,
  validateRegisterClient,
  validateRegisterWorker,
  validateLogin,
  validateGenerateAccessToken,
  validateLogout,
  validateReviewStatus,
} from '../validators/auth.js';
import { authenticateAccess, authenticateLogin, authenticateRefresh, authenticateRegister, isActive } from '../middlewares/authMiddleware.js';
import { validateJSONField } from '../validators/common.js';

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
authRouter.post(
  '/otp/request',
  ...validateRequestOTP,
  validateRequest,
  checkSendOtpLimit,
  requestOTP
);
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
authRouter.post(
  '/otp/verify',
  ...validateVerifyOTP,
  validateRequest,
  checkVerifyLimit,
  verifyOTP
);
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
 *       - `userData` — JSON string with user info
 *       - `clientProfile` — JSON string with client address info
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
 *             required: [userData, clientProfile]
 *             properties:
 *               personal_image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (optional, jpeg/png/webp)
 *               userData:
 *                 type: string
 *                 default: '{"firstName":"أحمد","middleName":"علي","lastName":"محمد","governmentId":"123e4567-e89b-12d3-a456-426614174000","city":"المنصورة"}'
 *                 description: |
 *                   JSON string containing:
 *                   - `firstName` (string, required, 2-50 chars)
 *                   - `middleName` (string, required, 2-50 chars)
 *                   - `lastName` (string, required, 2-50 chars)
 *                   - `governmentId` (UUID, required)
 *                   - `city` (string, required, 2-50 chars)
 *               clientProfile:
 *                 type: string
 *                 default: '{"address":"123 شارع الرئيسي، المنصورة","addressNotes":"بجوار المسجد الكبير"}'
 *                 description: |
 *                   JSON string containing:
 *                   - `address` (string, required, 2-50 chars)
 *                   - `addressNotes` (string, optional)
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
  upload.single("personal_image"),
  authenticateRegister,
  validateJSONField("userData"),
  validateJSONField("clientProfile"),
  ...validateRegisterClient,
  validateRequest,
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
 *       - `userData` — JSON string with user info
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
 *                 default: '{"firstName":"أحمد","middleName":"علي","lastName":"محمد","governmentId":"123e4567-e89b-12d3-a456-426614174000","city":"المنصورة"}'
 *                 description: |
 *                   JSON string containing:
 *                   - `firstName` (string, required, 2-50 chars)
 *                   - `middleName` (string, required, 2-50 chars)
 *                   - `lastName` (string, required, 2-50 chars)
 *                   - `governmentId` (UUID, required)
 *                   - `city` (string, required, 2-50 chars)
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
    { name: "personal_image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
    { name: "personal_with_id_image", maxCount: 1 }
  ]),
  validateJSONField("userData"),
  validateJSONField("workerProfile"),
  ...validateRegisterWorker,
  validateRequest,
  authenticateRegister,
  registerWorker
);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: |
 *       Authenticates an existing user using a **login token** (from OTP verify) and creates a session.
 *       Use the token returned by `/auth/otp/verify` (tokenType: "login") as `Bearer <token>` in the Authorization header.
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
authRouter.post(
  '/login',
  authenticateLogin,
  ...validateLogin,
  validateRequest,
  login
);
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
authRouter.post(
  '/logout',
  authenticateAccess,
  ...validateLogout,
  validateRequest,
  isActive,
  logout
);
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
authRouter.get(
  '/access',
  authenticateRefresh,
  ...validateGenerateAccessToken,
  validateRequest,
  isActive,
  generateAccessToken
);
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
authRouter.get(
  '/review-status',
  authenticateAccess,
  ...validateReviewStatus,
  validateRequest,
  reviewStatus
);
export default authRouter;
