/**
 * @fileoverview Auth Controller - Handle authentication-related HTTP requests
 * @module controllers/AuthController
 */

import {
  RegisterClientRequestDTO,
  RequestOTPRequestDTO,
  VerifyOTPRequestDTO,
  RegisterWorkerRequestDTO,
  UpdateFcmTokenRequestDTO,
  RequestOTPQueryDTO,
  RequestOTPParamsDTO,
  VerifyOTPQueryDTO,
  VerifyOTPParamsDTO,
  RegisterClientQueryDTO,
  RegisterClientParamsDTO,
  RegisterWorkerQueryDTO,
  RegisterWorkerParamsDTO,
  LoginRequestDTO,
  LoginQueryDTO,
  LoginParamsDTO,
  LogoutRequestDTO,
  LogoutQueryDTO,
  LogoutParamsDTO,
  GenerateAccessTokenRequestDTO,
  GenerateAccessTokenQueryDTO,
  GenerateAccessTokenParamsDTO,
  ReviewStatusRequestDTO,
  ReviewStatusQueryDTO,
  ReviewStatusParamsDTO,
  UpdateFcmTokenQueryDTO,
  UpdateFcmTokenParamsDTO,
} from '../schemas/requests/auth.request.js';
import {
  RequestOTPResponseDTO,
  VerifyOTPResponseDTO,
  RegisterClientResponseDTO,
  RegisterWorkerResponseDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
  GenerateAccessTokenResponseDTO,
  ReviewStatusResponseDTO,
  UpdateFcmTokenResponseDTO,
} from '../schemas/responses/auth.response.js';
import AppError from '../errors/AppError.js';
import { authService, rateLimitService, presenceService, notificationService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import prisma from '../libs/database.js';

/**
 * Request OTP for phone number verification
 * @description Initiates OTP request by generating and sending OTP to the provided phone number
 */
export const requestOTP = asyncHandler<RequestOTPResponseDTO, RequestOTPRequestDTO, RequestOTPQueryDTO, RequestOTPParamsDTO>(async (req, res) => {
  const { method, phoneNumber } = req.parsed!.body!;
  const deviceId = req.deviceId;

  const { cooldown } = await rateLimitService.incrementSend(phoneNumber, method, deviceId);

  await authService.requestOTP(phoneNumber, method);

  res.status(200).send({ status: 'success', message: 'OTP sent successfully', data: { phoneNumber, method, cooldown } });
});

/**
 * Verify OTP and return login or register token
 * @description Verifies the OTP and returns either a login or register token based on user existence
 */
export const verifyOTP = asyncHandler<VerifyOTPResponseDTO, VerifyOTPRequestDTO, VerifyOTPQueryDTO, VerifyOTPParamsDTO>(async (req, res) => {
  const { phoneNumber, otp, method } = req.parsed!.body!;
  const deviceId = req.deviceId;

  const { tokenType, token, workerVerificationInfo } = await authService.verifyOTP(
    phoneNumber,
    method,
    otp,
    deviceId
  );

  res.status(200).send({
    status: 'success',
    message: 'OTP verified successfully',
    data: { tokenType, token, ...workerVerificationInfo },
  });
});

/**
 * Register a new client user
 * @description Registers a new client user with basic profile information
 */
export const registerClient = asyncHandler<RegisterClientResponseDTO, RegisterClientRequestDTO, RegisterClientQueryDTO, RegisterClientParamsDTO>(async (req, res) => {
  const deviceId = req.deviceId;
  const { userData } = req.parsed!.body!;
  const { firstName, middleName, lastName, location } = userData;

  const rawToken = req.headers['authorization']?.split(' ')[1];
  if (!rawToken) throw new AppError('Unauthorized, register token not found', 401);

  const { phoneNumber } = await authService.consumeRegisterToken(rawToken);
  const image = req.file;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { user, profile } = await authService.registerClient(
    {
      phoneNumber,
      firstName,
      middleName,
      lastName,
      profileImageBuffer: image?.buffer ?? undefined,
      location,
    },
    {}
  );

  const { unHashedRefreshToken } = await authService.login({
    phoneNumber,
    deviceId,
    expiresAt,
  });

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId: user.id,
    isAdmin: false,
    refreshToken: unHashedRefreshToken,
  });

  res.status(201).send({
    status: 'success',
    message: 'User created successfully',
    data: { user, clientProfile: profile, accessToken, refreshToken: unHashedRefreshToken },
  });
});

/**
 * Register a new worker user
 * @description Registers a new worker user with professional profile information
 */
export const registerWorker = asyncHandler<RegisterWorkerResponseDTO, RegisterWorkerRequestDTO, RegisterWorkerQueryDTO, RegisterWorkerParamsDTO>(async (req, res) => {
  const { userData, workerProfile } = req.parsed!.body!;
  const { firstName, middleName, lastName, location } = userData;
  const { experienceYears, isInTeam, acceptsUrgentJobs, specializationsTree, workGovernmentIds } =
    workerProfile;

  const deviceId = req.deviceId;
  const rawToken = req.headers['authorization']?.split(' ')[1];
  if (!rawToken) throw new AppError('Unauthorized, register token not found', 401);

  const { phoneNumber } = await authService.consumeRegisterToken(rawToken);
  const images = req.files;

  if (
    !images ||
    !images['personal_image'] ||
    !images['id_image'] ||
    !images['personal_with_id_image']
  )
    throw new AppError('Please upload all required images', 400);

  const { user, profile } = await authService.registerWorker(
    {
      phoneNumber,
      firstName,
      middleName,
      lastName,
      profileImageBuffer: images['personal_image'][0].buffer,
      location,
    },
    {
      idImageBuffer: images['id_image'][0].buffer,
      profileWithIdImageBuffer: images['personal_with_id_image'][0].buffer,
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      specializationsTree,
      workGovernmentIds,
    }
  );

  const { unHashedRefreshToken } = await authService.login({
    phoneNumber,
    deviceId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId: user.id,
    isAdmin: false,
    refreshToken: unHashedRefreshToken,
  });

  res.status(201).send({
    status: 'success',
    message: 'User created successfully',
    data: { user, workerProfile: profile, accessToken, refreshToken: unHashedRefreshToken },
  });
});

/**
 * Login an existing user and create session
 * @description Authenticates user with login token and creates a new session
 */
export const login = asyncHandler<LoginResponseDTO, LoginRequestDTO, LoginQueryDTO, LoginParamsDTO>(async (req, res) => {
  const deviceId = req.deviceId;
  const rawToken = req.headers['authorization']?.split(' ')[1];
  if (!rawToken) throw new AppError('Unauthorized, login token not found', 401);

  const { phoneNumber } = await authService.consumeLoginToken(rawToken);

  const { unHashedRefreshToken, user } = await authService.login({
    phoneNumber,
    deviceId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId: user.id,
    isAdmin: false,
    refreshToken: unHashedRefreshToken,
  });

  res.status(200).send({
    status: 'success',
    message: 'login successfully',
    data: { user, refreshToken: unHashedRefreshToken, accessToken },
  });
});

/**
 * Logout user and revoke session
 * @description Revokes the user's session based on device fingerprint and cleans up presence
 */
export const logout = asyncHandler<LogoutResponseDTO, LogoutRequestDTO, LogoutQueryDTO, LogoutParamsDTO>(async (req, res) => {
  const deviceId = req.deviceId;
  const userId = req.userState.userId;

  // Get the FCM token before revoking the session to unsubscribe from topics
  const session = await prisma.session.findFirst({
    where: { userId, deviceId, isRevoked: false },
    select: { fcmToken: true },
  });

  await authService.logout({ userId, deviceId });

  // Unsubscribe from topics in the background
  if (session?.fcmToken) {
    setImmediate(async () => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            workerProfile: { include: { workGovernments: { select: { id: true } } } },
            clientProfile: true,
            locations: { where: { isMain: true }, select: { governmentId: true }, take: 1 },
          },
        });

        if (!user) return;

        const topics = ['all', 'admins', 'workers', 'clients'];

        if (user.workerProfile) {
          user.workerProfile.workGovernments.forEach((gov) => topics.push(`gov_${gov.id}`));
        }
        if (user.locations.length > 0) {
          topics.push(`gov_${user.locations[0].governmentId}`);
        }

        const uniqueTopics = [...new Set(topics)];
        for (const topic of uniqueTopics) {
          notificationService.unsubscribeFromTopic(userId, deviceId, topic, session.fcmToken!);
        }
      } catch (err) {
        console.error('Failed to unsubscribe FCM token from topics:', err);
      }
    });
  }

  // Check if user has active sockets and handle offline cleanup
  const isUserOnline = await presenceService.isOnline(userId);
  if (isUserOnline) {
    await presenceService.handleUserOffline({ userId, reason: 'logout' });
  }

  res.status(200).send({ status: 'success', message: 'Logged out successfully' });
});

/**
 * Generate new access token using refresh token
 * @description Validates refresh token and generates a new access token
 */
export const generateAccessToken = asyncHandler<GenerateAccessTokenResponseDTO, GenerateAccessTokenRequestDTO, GenerateAccessTokenQueryDTO, GenerateAccessTokenParamsDTO>(async (req, res) => {
  const deviceId = String(req.headers['x-device-fingerprint']);
  const { userId } = req.userState;
  const adminState = req.adminState;

  const refreshToken = req.headers['authorization']?.split(' ')[1];

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId,
    isAdmin: adminState !== undefined,
    refreshToken,
  });

  res.status(200).send({ status: 'success', message: 'Access token generated successfully', data: { accessToken } });
});

/**
 * Reviews the status of a user (pending, approved, rejected)
 */
export const reviewStatus = asyncHandler<ReviewStatusResponseDTO, ReviewStatusRequestDTO, ReviewStatusQueryDTO, ReviewStatusParamsDTO>(async (req, res) => {
  if (req.userState.role === 'CLIENT') {
    res.status(200).send({ status: 'success', message: 'You are a client, you can whatever you want <3', data: { reason: 'You are a client', status: 'APPROVED' } });
    return;
  }

  if (req.userState.role === 'WORKER') {
    const isApproved = req.userState.worker.verification.status === 'APPROVED';
    const reason = req.userState.worker.verification.reason;
    const status = req.userState.worker.verification.status;
    if (!isApproved) {
      res.status(200).send({ status: 'success', message: 'You are not approved yet', data: { reason, status } });
      return;
    }
    res.status(200).send({ status: 'success', message: 'You have been approved by admin', data: { reason: '', status } });
    return;
  }

  throw new AppError('Forbidden', 403);
});

/**
 * Update FCM token for the current session
 */
export const updateFcmToken = asyncHandler<UpdateFcmTokenResponseDTO, UpdateFcmTokenRequestDTO, UpdateFcmTokenQueryDTO, UpdateFcmTokenParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const adminState = req.adminState;
  const deviceId = req.deviceId;
  const { fcmToken } = req.parsed!.body!;

  // Find the active session by userId + deviceId
  const session = await prisma.session.findFirst({
    where: { userId, deviceId, isRevoked: false },
    select: { id: true },
  });

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { fcmToken },
  });

  // Subscribe to topics in the background
  setImmediate(async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          workerProfile: { include: { workGovernments: { select: { id: true } } } },
          clientProfile: true,
          locations: { where: { isMain: true }, select: { governmentId: true }, take: 1 },
        },
      });

      if (!user) return;

      const topics = ['all'];

      if (adminState) {
        topics.push('admins');
      }
      if (user.workerProfile) {
        topics.push('workers');
        user.workerProfile.workGovernments.forEach((gov) => {
          topics.push(`gov_${gov.id}`);
        });
      }
      if (user.clientProfile) {
        topics.push('clients');
      }

      if (user.locations.length > 0) {
        topics.push(`gov_${user.locations[0].governmentId}`);
      }

      const uniqueTopics = [...new Set(topics)];

      for (const topic of uniqueTopics) {
        notificationService.subscribeToTopic(userId, deviceId, topic, fcmToken);
      }
    } catch (err) {
      console.error('Failed to subscribe FCM token to topics:', err);
    }
  });

  res.status(200).send({ status: 'success', message: 'FCM token updated successfully' });
});
