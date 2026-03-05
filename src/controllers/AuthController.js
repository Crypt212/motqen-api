/**
 * @fileoverview Auth Controller - Handle authentication-related HTTP requests
 * @module controllers/AuthController
 */

import { matchedData } from 'express-validator';
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import {
  authService,
  rateLimitService,
  userService,
  workerService,
} from '../state.js';

import { asyncHandler } from '../types/asyncHandler.js';
import { verifyAndDecodeToken } from '../utils/tokens.js';

/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler} RequestHandler */

/**
 * Request OTP for phone number verification
 * @description Initiates OTP request by generating and sending OTP to the provided phone number
 */
export const requestOTP = asyncHandler(async (req, res) => {
  const { method, phoneNumber } = matchedData(req, { includeOptionals: true });
  const deviceId = req.deviceId;

  await authService.requestOTP(phoneNumber, method);

  const { cooldown } = await rateLimitService.incrementSend(
    phoneNumber,
    method,
    deviceId
  );

  new SuccessResponse(
    'OTP sent successfully',
    { phoneNumber, method, cooldown },
    200
  ).send(res);
});

/**
 * Verify OTP and return login or register token
 * @description Verifies the OTP and returns either a login or register token based on user existence
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phoneNumber, otp, method } = matchedData(req, { includeOptionals: true });
  const deviceId = req.deviceId;

  const { tokenType, token } = await authService.verifyOTP(
    phoneNumber,
    method,
    otp,
    deviceId
  );

  let workerShit = {};
  if (tokenType === 'login') {
    const user = await userService.get({ phoneNumber, userId: undefined });
    const workProfile = await workerService.get({ userId: user.id });
    console.log(user, workProfile);
    workerShit.isWorker = workProfile ? true : false;
    if (workerShit.isWorker)
      workerShit.isWorkerSignedUp = (await workerService.getVerification({ workerProfileId: workProfile.id })).status === "APPROVED";
  } else {
    workerShit.isWorker = false;
    workerShit.isWorkerSignedUp = false;
  }

  new SuccessResponse(
    'OTP verified successfully',
    { tokenType, token, ...workerShit },
    200
  ).send(res);
});

/**
 * Register a new client user
 * @description Registers a new client user with basic profile information
 */
export const registerClient = asyncHandler(async (req, res) => {
  const deviceId = req.deviceId;
  const { userData: {
    firstName,
    middleName,
    lastName,
    governmentId,
    cityId,
  }, clientProfile: {
    address,
    addressNotes,
  } } = matchedData(req, { includeOptionals: true });


  const phoneNumber = verifyAndDecodeToken(req.headers['authorization'].split(' ')[1], "register").phoneNumber;
  const image = req.file;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { user, profile } = await authService.registerClient({
    userData: {
      phoneNumber,
      firstName,
      middleName,
      lastName,
      governmentId,
      role: "USER",
      cityId,
      profileImage: image,
    },
    clientProfileData: {
      address,
      addressNotes,
    }
  });

  const { unHashedRefreshToken } = await authService.login({
    phoneNumber,
    deviceId,
    expiresAt,
  });

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId: user.id,
    role: user.role,
    refreshToken: unHashedRefreshToken,
  });

  new SuccessResponse(
    'User created successfully',
    { user, clientProfile: profile, accessToken, refreshToken: unHashedRefreshToken },
    200
  ).send(res);
});

/**
 * Register a new worker user
 * @description Registers a new worker user with professional profile information
 */
export const registerWorker = asyncHandler(async (req, res) => {
  const {
    userData: {
      firstName,
      middleName,
      lastName,
      governmentId,
      cityId
    },
    workerProfile: {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      specializationsTree,
      workGovernmentIds,
    }
  } = matchedData(req, { includeOptionals: true });

  const deviceId = req.deviceId;
  const phoneNumber = verifyAndDecodeToken(req.headers['authorization'].split(' ')[1], "register").phoneNumber;
  const images = req.files;

  if (
    !images ||
    !images['personal_image'] ||
    !images['id_image'] ||
    !images['personal_with_id_image']
  )
    throw new AppError('Please upload all required images', 400);

  const { user, profile: workerProfile } = await authService.registerWorker({
    userData: {
      phoneNumber,
      firstName,
      middleName,
      lastName,
      governmentId,
      cityId,
      role: "USER",
      profileImage: images['personal_image'][0],
    },
    workerProfileData: {
      idImage: images['id_image'][0],
      profileWithIdImage: images['personal_with_id_image'][0],
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      specializationsTree,
      workGovernmentIds,
    }
  });

  const { unHashedRefreshToken } = await authService.login({
    phoneNumber,
    deviceId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId: user.id,
    role: user.role,
    refreshToken: unHashedRefreshToken,
  });

  new SuccessResponse(
    'User created successfully',
    { user, workerProfile, accessToken, refreshToken: unHashedRefreshToken },
    200
  ).send(res);
});

/**
 * Login an existing user and create session
 * @description Authenticates user with login token and creates a new session
 */
export const login = asyncHandler(async (req, res) => {

  const deviceId = req.deviceId;
  const phoneNumber = verifyAndDecodeToken(req.headers['authorization'].split(' ')[1], "login").phoneNumber;

  const { unHashedRefreshToken, user } = await authService.login({
    phoneNumber,
    deviceId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = await authService.generateAccessToken({
    deviceId,
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
 * @description Revokes the user's session based on device fingerprint
 */
export const logout = asyncHandler(async (req, res) => {
  const deviceId = req.deviceId;

  await authService.logout(req.userState.userId, deviceId);

  new SuccessResponse('Logged out successfully', null, 200).send(res);
});

/**
 * Generate new access token using refresh token
 * @description Validates refresh token and generates a new access token
 */
export const generateAccessToken = asyncHandler(async (req, res) => {
  const deviceId = String(req.headers['x-device-fingerprint']);
  const { userId, role } = req.userState;

  const refreshToken = req.headers['authorization']?.split(' ')[1];

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId,
    role,
    refreshToken,
  });

  new SuccessResponse(
    'Access token generated successfully',
    { accessToken },
    200
  ).send(res);
});


/**
 * Reviews the status of a user (pending, approved, rejected)
 */
export const reviewStatus = asyncHandler(async (req, res) => {
  if (req.userState.client) {
    new SuccessResponse('You are a client, you can whatever you want <3', {}, 200).send(res);
    return;
  }

  if (req.userState.worker) {
    const isApproved = req.userState.worker.verification.status === "APPROVED";
    const reason = req.userState.worker.verification.reason;
    const status = req.userState.worker.verification.status;
    if (!isApproved) {
      new SuccessResponse('You are not approved yet', { reason, status }, 200).send(res);
      return
    }
    new SuccessResponse('You have been approved by admin', { status }, 200).send(res);
    return;
  }


  throw new AppError('Who the hell are you?!', 401);
});
