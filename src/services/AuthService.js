import { generateOTP, hashOTP } from '../utils/OTP.js';

/**
 * @fileoverview User Service - Handle authentication
 * @module services/AuthService
 */

import crypto from 'crypto';
import AppError from '../errors/AppError.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import Service, { tryCatch } from './Service.js';
import OtpCache from '../repositories/cache/OTPCache.js';
import SessionRepository from '../repositories/database/SessionRepository.js';
import UserRepository from '../repositories/database/UserRepository.js';
import environment from '../configs/environment.js';
import SendOTPProvider from '../providers/SendOTPProvider.js';
import * as pkg from '@prisma/client';
const { $Enums } = pkg;
import RateLimitCache from '../repositories/cache/RateLimitCache.js';
import { generateToken } from '../utils/tokens.js';
import { logger } from '../libs/winston.js';
import GovernmentRepository from '../repositories/database/GovernmentRepository.js';

const MAX_VERIFY_ATTEMPTS = 5;

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */
/** @typedef {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} File */

/** @typedef {{ phoneNumber: string, role: $Enums.Role, firstName: string, middleName: string, lastName: string, governmentId: IDType, cityId: IDType, profileImageBuffer: Buffer | undefined }} InputUserData */
/** @typedef {{ isInTeam: Boolean, experienceYears: number, acceptsUrgentJobs: Boolean, workGovernmentIds: IDType[], specializationsTree: { mainId: IDType, subIds: IDType[]}[], idImageBuffer: Buffer, profileWithIdImageBuffer: Buffer  }} InputWorkerData */
/** @typedef {{ address: string, addressNotes?: string  }} InputClientData */

/** @typedef {{ phoneNumber: string, role: $Enums.Role, firstName: string, middleName: string, lastName: string, governmentId: IDType, city: string, status: $Enums.AccountStatus }} ReturnUserData */

/**
 * Auth Service
 * @class
 * @extends Service
 */
export default class AuthService extends Service {
  /** @type {UserRepository} */
  #userRepository;
  /** @type {OtpCache} */
  #otpCache;
  /** @type {SessionRepository} */
  #sessionRepository;
  /** @type {GovernmentRepository} */
  #governmentRepository;
  /** @type {RateLimitCache} */
  #rateLimitCache;

  /**
   * @param {Object} params
   * @param {UserRepository} params.userRepository
   * @param {GovernmentRepository} params.governmentRepository
   * @param {OtpCache} params.otpCache
   * @param {SessionRepository} params.sessionRepository
   * @param {RateLimitCache} params.rateLimitCache
   */
  constructor({
    userRepository,
    governmentRepository,
    otpCache,
    sessionRepository,
    rateLimitCache,
  }) {
    super();
    this.#userRepository = userRepository;
    this.#governmentRepository = governmentRepository;
    this.#sessionRepository = sessionRepository;
    this.#rateLimitCache = rateLimitCache;
    this.#otpCache = otpCache;
  }

  /**
   * Register a new worker user
   * @async
   * @method registerWorker
   * @param {Object} params - User registration data
   * @param {InputUserData} params.userData
   * @param {InputWorkerData} params.workerProfileData
   * @returns {Promise<{ user: import("../repositories/database/UserRepository.js").User & { cityName: string }, profile: import("@prisma/client").WorkerProfile }>}
   * @throws {AppError} If government or city not found
   */
  async registerWorker({
    userData: {
      phoneNumber,
      firstName,
      middleName,
      lastName,
      governmentId,
      cityId,
      role,
      profileImageBuffer,
    },
    workerProfileData: {
      idImageBuffer,
      profileWithIdImageBuffer,
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      specializationsTree,
      workGovernmentIds,
    },
  }) {
    return tryCatch(async () => {
      const cities = await this.#governmentRepository.findCities({
        filter: { id: cityId, governmentId },
      });
      if (!cities || cities.data.length === 0)
        throw new AppError('Government or city not found', 400);

      const { user, profile } = await this.#userRepository.createWorker({
        userData: {
          phoneNumber,
          role,
          firstName,
          middleName,
          lastName,
          governmentId,
          cityId,
          status: 'ACTIVE',
        },
        workerProfileData: {
          experienceYears,
          isInTeam: Boolean(isInTeam),
          acceptsUrgentJobs: Boolean(acceptsUrgentJobs),
        },
        verificationData: undefined,
      });

      /** @type {string} */
      const nationalID = (
        await uploadToCloudinary(
          idImageBuffer,
          `${user.id}/verification_info`,
          'nationalID'
        )
      ).url;

      /** @type {string} */
      const selfiWithID = (
        await uploadToCloudinary(
          profileWithIdImageBuffer,
          `${user.id}/verification_info`,
          'selfiWithID'
        )
      ).url;

      const verification =
        await this.#userRepository.upsertWorkerProfileVerification({
          workerProfileId: profile.id,
          verificationData: {
            idWithPersonalImageUrl: nationalID,
            idDocumentUrl: selfiWithID,
            status: 'PENDING',
            reason: 'Waiting for verification',
          },
        });

      await this.#userRepository.insertWorkerProfileGovernments({
        workerProfileId: profile.id,
        governmentIds: workGovernmentIds,
      });
      await this.#userRepository.insertWorkerProfileSpecializations({
        workerProfileId: profile.id,
        specializationsTree,
      });

      const { url } = await uploadToCloudinary(
        profileImageBuffer,
        `${phoneNumber}/profile_image`,
        'profileMain'
      );
      await this.#userRepository.updateMany(
        { profileImageUrl: url },
        { id: user.id }
      );
      user.profileImageUrl = url;

      /** @type {import("../repositories/database/UserRepository.js").User & { cityName: string }} */
      const modifiedUser = { ...user, cityName: cities.data[0].name };

      return { profile, user: modifiedUser, verification };
    });
  }

  /**
   * Register a new client user
   * @async
   * @method registerClient
   * @param {Object} params - User registration data
   * @param {InputUserData} params.userData
   * @param {InputClientData} params.clientProfileData
   * @returns {Promise<{ user: import("../repositories/database/UserRepository.js").User & { cityName: string }, profile: import("@prisma/client").ClientProfile }>} Created user object
   * @throws {AppError} If government or city not found
   */
  async registerClient({
    userData: {
      firstName,
      middleName,
      lastName,
      phoneNumber,
      governmentId,
      cityId,
      role,
      profileImageBuffer,
    },
    clientProfileData: { address, addressNotes },
  }) {
    return tryCatch(async () => {
      const cities = await this.#governmentRepository.findCities({
        filter: { id: cityId, governmentId },
      });
      if (!cities || cities.data.length === 0)
        throw new AppError('Government or city not found', 400);

      const { user, profile } = await this.#userRepository.createClient({
        userData: {
          phoneNumber,
          role,
          firstName,
          middleName,
          lastName,
          governmentId,
          cityId,
          status: 'ACTIVE',
        },
        clientProfileData: {
          address,
          addressNotes,
        },
      });

      /** @type {import("../repositories/database/UserRepository.js").User & { cityName: string }} */
      const modifiedUser = { ...user, cityName: cities.data[0].name };

      if (profileImageBuffer) {
        const { url } = await uploadToCloudinary(
          profileImageBuffer,
          `${user.id}/profile_image`,
          'profileMain'
        );

        await this.#userRepository.updateMany(
          { profileImageUrl: url },
          { id: user.id }
        );
        user.profileImageUrl = url;
      }

      return { profile, user: modifiedUser };
    });
  }

  /**
   * Request a new OTP for the given phone number
   * @async
   * @method requestOTP
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method (SMS or WhatsApp)
   * @returns {Promise<boolean>} True if OTP was sent successfully
   * @description Generates a new OTP and sends it via the specified method
   */
  async requestOTP(phoneNumber, method) {
    const OTP = generateOTP();
    const hashedOTP = hashOTP(OTP);

    await this.#otpCache.setOtp(
      phoneNumber,
      method,
      hashedOTP,
      environment.otps.expiresIn
    );

    await SendOTPProvider(method, OTP, phoneNumber);

    // Reset verify attempts so user gets 5 fresh attempts on the new code
    if (environment.nodeEnv !== 'development')
      await this.#rateLimitCache.resetVerifyAttempts(phoneNumber, method);

    return true;
  }

  /**
   * Validate an OTP
   * @async
   * @method isValidOTP
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @param {string} OTP - The OTP to validate (hashed)
   * @param {string} deviceId - The device identifier
   * @returns {Promise<{ tokenType: "register" | "login", token: string}>} Validation result
   * @description Checks if the provided OTP is valid and not expired
   */
  async verifyOTP(phoneNumber, method, OTP, deviceId) {
    // in production -> Invalid or expired OTP only

    try {
      const hashedOTP = hashOTP(OTP);

      if (!OTP) throw new AppError('OTP is not provided', 422, { type: 'OTP' });

      const otp = await this.#otpCache.getOtp(phoneNumber, method);

      if (!otp || hashedOTP !== otp)
        throw new AppError("OTP is expired or doesn't match", 400, {
          type: 'OTP',
        });

      await this.#otpCache.deleteOtp(phoneNumber, method);

      await this.#rateLimitCache.incrementVerify(phoneNumber, method);

      await this.#rateLimitCache.resetAfterSuccess(
        phoneNumber,
        method,
        deviceId
      );
      const user = await this.#userRepository.findFirst({ phoneNumber });

      /** @type {string} */
      let token;
      /** @type {"register" | "login"} */
      let tokenType;
      if (user) {
        /** @type import("../types/tokens.js").LoginTokenPayload */
        const payload = { type: 'login', phoneNumber };
        tokenType = 'login';
        token = generateToken(payload);
      } else {
        /** @type import("../types/tokens.js").RegisterTokenPayload */
        const payload = { type: 'register', phoneNumber };
        tokenType = 'register';
        token = generateToken(payload);
      }
      return { tokenType, token };
    } catch (error) {
      if (!(error instanceof AppError && error.errors.type === 'OTP'))
        throw error;
      const record = await this.#rateLimitCache.incrementVerify(
        phoneNumber,
        method
      );

      const limitStatus = {
        attempts: record.attempts,
        remaining: Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts),
        blocked: record.attempts >= MAX_VERIFY_ATTEMPTS,
      };

      throw new AppError(error.message, 400, {
        remainingAttempts: limitStatus.remaining,
        requestNewOtp: limitStatus.blocked,
      });
    }
  }

  /**
   * Generates a new access token based on the provided refresh token.
   * @async
   * @method generateAccessToken
   * @param {Object} params - Token generation parameters
   * @param {string} params.refreshToken - The refresh token
   * @param {string} params.deviceId - Device fingerprint
   * @param {string} params.userId - User's ID
   * @param {import("../types/role.js").Role} params.role - User's role
   * @returns {Promise<string>} Generated access token
   * @throws {AppError} If refresh token is invalid, revoked, or expired
   */
  async generateAccessToken({ refreshToken, deviceId, userId, role }) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const session = await this.#sessionRepository.findFirst({
      userId,
      deviceId: deviceId,
      token: hashedToken,
    });

    if (!session) {
      throw new AppError('Invalid or Expired refresh token', 400);
    }
    if (session.isRevoked) {
      throw new AppError('Refresh token has been revoked', 400);
    }
    if (session.expiresAt.getTime() < Date.now()) {
      await this.#sessionRepository.deleteMany({ id: session.id });
      throw new AppError('Refresh token has expired', 400);
    }

    const user = await this.#userRepository.findFirst({ id: userId });

    const accessToken = generateToken({
      type: 'access',
      userId,
      role: role,
      phoneNumber: user.phoneNumber,
    });
    return accessToken;
  }

  /**
   * Creates a new refresh token for the given user ID and device fingerprint.
   * @async
   * @method create
   * @param {Object} params - Session creation parameters
   * @param {string} params.phoneNumber - The user's phone number
   * @param {string} params.deviceId - Device fingerprint
   * @param {Date} [params.expiresAt] - Token expiration date
   * @param {string} [params.ipAddress] - Client IP address
   * @param {string} [params.userAgent] - Client user agent
   * @returns {Promise<{session: Object, user: import("../repositories/database/UserRepository.js").OptionalUser, unHashedRefreshToken: string}>} Created session and refresh token
   * @description Creates a new session, revokes existing ones for the same device
   */
  async login({ phoneNumber, deviceId: deviceFingerprint, expiresAt }) {
    await this.#sessionRepository.deleteMany({ deviceId: deviceFingerprint });
    const user = await this.#userRepository.findFirst({ phoneNumber });
    const unHashedRefreshToken = generateToken({
      type: 'refresh',
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    logger.info('Generated Refresh Token:', expiresAt);

    const hashedToken = crypto
      .createHash('sha256')
      .update(unHashedRefreshToken)
      .digest('hex');

    const session = await this.#sessionRepository.create({
      isRevoked: false,
      lastUsedAt: new Date(Date.now()),
      createdAt: new Date(Date.now()),
      userId: user.id,
      deviceId: deviceFingerprint,
      expiresAt,
      token: hashedToken,
    });
    return { session, user, unHashedRefreshToken: unHashedRefreshToken };
  }

  /**
   * Revokes all sessions for a given user ID and device fingerprint.
   * @async
   * @method revokeByUserIDAndFingerprint
   * @param {string} userId - The user ID to revoke sessions for.
   * @param {string} deviceFingerprint - The device fingerprint to revoke sessions for.
   * @returns {Promise<void>}
   */
  async logout(userId, deviceFingerprint) {
    try {
      await this.#sessionRepository.deleteMany({
        userId,
        deviceId: deviceFingerprint,
      });
    } catch (err) {
      logger.error('Failed to revoke session:', err);
      throw err;
    }
  }
}
