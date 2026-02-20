/**
 * @fileoverview Auth Controllers - Handle authentication-related HTTP requests
 * @module controllers/AuthControllers
 */

import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import {
  otpService,
  sessionService,
  userService,
  rateLimitService,
  otpRepository,
  rateLimitRepository,
  authService,
} from '../state.js';
import { hashOTP } from '../utils/OTP.js';
import { generateToken, verifyAndDecodeToken } from '../utils/tokens.js';
import {
  asyncUnAuthenticatedHandler,
  asyncAuthenticatedHandler,
} from '../types/asyncHandler.js';

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
const getClientIp = (req) => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    'unknown'
  );
};

/**
 * Request OTP for phone number verification
 * @async
 * @function requestOTP
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Initiates OTP request by generating and sending OTP to the provided phone number
 */
export const requestOTP = asyncUnAuthenticatedHandler(async (req, res) => {
  const { method, phoneNumber } = req.body;
  const deviceId =
    req.headers['x-device-fingerprint']?.trim() ||
    req.headers['x-device-id']?.trim() ||
    req.ip;

  await otpService.requestOTP(phoneNumber, method);
  await rateLimitService.incrementSend(phoneNumber, deviceId);

  new SuccessResponse(
    'OTP sent successfully',
    { phoneNumber, method },
    200
  ).send(res);
});

/**
 * Verify OTP and return login or register token
 * @async
 * @function verifyOTP
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Verifies the OTP and returns either a login or register token based on user existence
 */
export const verifyOTP = asyncUnAuthenticatedHandler(async (req, res) => {
  const { phoneNumber, otp, method } = req.body;

  const hashedOTP = hashOTP(otp);

  const result = await otpService.isValidOTP(phoneNumber, method, hashedOTP);
  if (!result.ok) {
    await rateLimitRepository.incrementVerify(phoneNumber);
    throw new AppError(result.message, 400);
  }

  await otpRepository.delete({ hashedOTP });
  await rateLimitService.reset(phoneNumber);
  const user = await userService.getUser(phoneNumber);

  let token = '';
  let tokenType = '';
  if (user) {
    /** @type import("../types/tokens.js").LoginTokenPayload */
    const payload = { type: 'login', phoneNumber, role: user.role };
    tokenType = 'login';
    token = generateToken(payload);
  } else {
    /** @type import("../types/tokens.js").RegisterTokenPayload */
    const payload = { type: 'register', phoneNumber };
    tokenType = 'register';
    token = generateToken(payload);
  }

  new SuccessResponse(
    'OTP verified successfully',
    { phoneNumber, tokenType, token },
    200
  ).send(res);
});

/**
 * Register a new client user
 * @async
 * @function registerClient
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Registers a new client user with basic profile information
 */
export const registerClient = asyncUnAuthenticatedHandler(async (req, res) => {
  const { registerToken, firstName, lastName, government, city, bio } = req.body;
  const { phoneNumber } = verifyAndDecodeToken(registerToken, 'register');

  const user = await authService.register({
    phoneNumber,
    firstName,
    lastName,
    government,
    city,
    bio,
  });


  const clientProfile = await userService.createClientProfile({
    userId: user.id,
  });


  new SuccessResponse('User created successfully', { user, clientProfile }, 200).send(res);
});

/**
 * Register a new worker user
 * @async
 * @function registerWorker
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Registers a new worker user with professional profile information
 */
export const registerWorker = asyncUnAuthenticatedHandler(async (req, res) => {
  const {
    registerToken,
    firstName,
    lastName,
    government,
    city,
    bio,
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationNames,
    subSpecializationNames,
    workGovernmentNames } = req.body;
  const { phoneNumber } = verifyAndDecodeToken(registerToken, 'register');

  const user = await authService.register({
    phoneNumber,
    firstName,
    lastName,
    government,
    city,
    bio,
  });

  const workerProfile = await userService.createWorkerProfile(user.id, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationNames,
    subSpecializationNames,
    governmentNames: workGovernmentNames
  });

  new SuccessResponse('User created successfully', { user, workerProfile }, 200).send(res);
});

/**
 * Login an existing user and create session
 * @async
 * @function login
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Authenticates user with login token and creates a new session
 */
export const login = asyncUnAuthenticatedHandler(async (req, res) => {
  const { loginToken, deviceFingerprint } = req.body;
  const payload = verifyAndDecodeToken(loginToken, 'login');

  const user = await userService.getUser({ phoneNumber: payload.phoneNumber });

  if (!user) throw new AppError('User not found', 404);

  const { unHashedRefreshToken } = await sessionService.createSession({
    userId: user.id,
    deviceFingerprint,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    role: user.role,
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });

  new SuccessResponse(
    'login successfully',
    { user, refreshToken: unHashedRefreshToken },
    200
  ).send(res);
});

/**
 * Logout user and revoke session
 * @async
 * @function logout
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Revokes the user's session based on device fingerprint
 */
export const logout = asyncAuthenticatedHandler(async (req, res) => {
  const fingerprint = String(req.headers['x-device-fingerprint']);
  await sessionService.revokeByUserIDAndFingerprint(req.user.id, fingerprint);
  new SuccessResponse('Logged out successfully', null, 200).send(res);
});

/**
 * Generate new access token using refresh token
 * @async
 * @function generateAccessToken
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Validates refresh token and generates a new access token
 */
export const generateAccessToken = asyncUnAuthenticatedHandler(
  async (req, res) => {
    const deviceFingerprint = String(req.headers['x-device-fingerprint']);
    const refreshToken = req.headers['authorization']?.split(' ')[1];

    const { role, userId } = verifyAndDecodeToken(refreshToken, 'refresh');
    const accessToken = await sessionService.generateAccessToken({
      deviceFingerprint,
      userId,
      role,
      refreshToken,
    });
    new SuccessResponse(
      'Access token generated successfully',
      { accessToken },
      200
    ).send(res);
  }
);
