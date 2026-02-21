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
  authService,
  rateLimitService,
} from '../state.js';

import { generateToken, verifyAndDecodeToken } from '../utils/tokens.js';
import {
  asyncHandler,
} from '../types/asyncHandler.js';
import { dataUri } from '../configs/multer.js';
import { uploader } from '../configs/cloudinary.js';
import { getHeaderValue } from '../utils/HTTTHeaders.js';

/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @typedef {import("../types/asyncHandler.js").MulterPayload} MulterPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

/**
 * Request OTP for phone number verification
 * @type {RequestHandler<{}>}
 * @description Initiates OTP request by generating and sending OTP to the provided phone number
 */
export const requestOTP = asyncHandler(async (req, res) => {
  const { method, phoneNumber } = req.body;
  const deviceId =
    getHeaderValue(req.headers['x-device-fingerprint'])?.trim() ||
    getHeaderValue(req.headers['x-device-id'])?.trim(); // requestOTP


  await otpService.requestOTP(phoneNumber, method);
  const { cooldown } = await rateLimitService.incrementSend(phoneNumber, method, deviceId);

  new SuccessResponse(
    'OTP sent successfully',
    { phoneNumber, method, cooldown },
    200
  ).send(res);
});

/**
 * Verify OTP and return login or register token
 * @type {RequestHandler<{}>}
 * @description Verifies the OTP and returns either a login or register token based on user existence
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phoneNumber, otp, method } = req.body;
  const deviceId =
    getHeaderValue(req.headers['x-device-fingerprint'])?.trim() ||
    getHeaderValue(req.headers['x-device-id'])?.trim();

  const result = await otpService.verifyOTP(phoneNumber, method, otp);

  if (!result.ok) {
    const limitStatus = await rateLimitService.incrementVerify(phoneNumber, method);
    throw new AppError(result.message, 400, {
      remainingAttempts: limitStatus.remaining,
      requestNewOtp: limitStatus.blocked,
    });
  }

  await rateLimitService.reset(phoneNumber, method, deviceId);
  const user = await userService.getUser({ phoneNumber });

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
 * @type {RequestHandler<MulterPayload>}
 * @description Registers a new client user with basic profile information
 */
export const registerClient = asyncHandler(async (req, res) => {
  const { registerToken , deviceFingerprint, firstName, lastName, government, city, bio } = req.body;
  const image = req.file;
  const { phoneNumber } = verifyAndDecodeToken(registerToken, 'register');

  if (image && image.fieldname == "personal_image") {
    const file = dataUri(req.file).content;
    await uploader.upload(file);
  }

  const user = await authService.register({
    phoneNumber,
    firstName,
    lastName,
    government,
    city,
    profileImage: image.path,
    bio,
  });

  const { unHashedRefreshToken } = await sessionService.createSession({
    userId: user.id,
    deviceFingerprint,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    role: user.role,
  });

  const accessToken = await sessionService.generateAccessToken({
    deviceFingerprint,
    userId: user.id,
    role: user.role,
    refreshToken: unHashedRefreshToken,
  });


  const clientProfile = await userService.createClientProfile({
    userId: user.id,
  });


  new SuccessResponse('User created successfully', { user, clientProfile, accessToken, refreshToken: unHashedRefreshToken }, 200).send(res);
});

/**
 * Register a new worker user
 * @type {RequestHandler<MulterPayload>}
 * @description Registers a new worker user with professional profile information
 */
export const registerWorker = asyncHandler(async (req, res) => {
  const {
    registerToken,
    deviceFingerprint,
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
    workGovernmentNames
  } = req.body;

  const { phoneNumber } = verifyAndDecodeToken(registerToken, 'register');
  const images = req.files;

  if (!images || !images["personal_image"] || !images["id_image"] || !images["personal_with_id_image"])
    throw new AppError("Please upload all required images", 400);

  const user = await authService.register({
    phoneNumber,
    firstName,
    lastName,
    government,
    city,
    profileImage: images["personal_image"][0].path,
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

  const { unHashedRefreshToken } = await sessionService.createSession({
    userId: user.id,
    deviceFingerprint,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    role: user.role,
  });

  const accessToken = await sessionService.generateAccessToken({
    deviceFingerprint,
    userId: user.id,
    role: user.role,
    refreshToken: unHashedRefreshToken,
  });

  for (let imageName of ["personal_image", "id_image", "personal_with_id_image"]) {
    const file = dataUri(images[imageName]).content;
    await uploader.upload(file);
  }


  new SuccessResponse('User created successfully', { user, workerProfile, accessToken }, 200).send(res);
});

/**
 * Login an existing user and create session
 * @type {RequestHandler<{}>}
 * @description Authenticates user with login token and creates a new session
 */
export const login = asyncHandler(async (req, res) => {
  const { loginToken, deviceFingerprint } = req.body;
  const payload = verifyAndDecodeToken(loginToken, 'login');

  const user = await userService.getUser({ phoneNumber: payload.phoneNumber });

  if (!user) throw new AppError('User not found', 404);

  const { unHashedRefreshToken } = await sessionService.createSession({
    userId: user.id,
    deviceFingerprint,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    role: user.role,
  });

  const accessToken = await sessionService.generateAccessToken({
    deviceFingerprint,
    userId: user.id,
    role: user.role,
    refreshToken: unHashedRefreshToken,
  });

  new SuccessResponse(
    'login successfully',
    { user, refreshToken: unHashedRefreshToken, accessToken },
    200
  ).send(res);
});

/**
 * Logout user and revoke session
 * @type {RequestHandler<UserPayload>}
 * @description Revokes the user's session based on device fingerprint
 */
export const logout = asyncHandler(async (req, res) => {
  const fingerprint = req.headers['x-device-fingerprint'];

  if (!fingerprint || typeof fingerprint !== 'string') {
    throw new AppError("Device fingerprint is required", 400);
  }

  await sessionService.revokeByUserIDAndFingerprint(req.user.id, fingerprint);
  new SuccessResponse('Logged out successfully', null, 200).send(res);
});

/**
 * Generate new access token using refresh token
 * @type {RequestHandler<UserPayload>}
 * @description Validates refresh token and generates a new access token
 */
export const generateAccessToken = asyncHandler(
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
