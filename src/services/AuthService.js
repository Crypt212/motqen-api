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
import RateLimitCache from '../repositories/cache/RateLimitCache.js';
import { generateToken } from '../utils/tokens.js';
import { logger } from '../libs/winston.js';
import GovernmentRepository from '../repositories/database/GovernmentRepository.js';
import ClientRepository from '../repositories/database/ClientRepository.js';
import WorkerRepository from '../repositories/database/WorkerRepository.js';

const MAX_VERIFY_ATTEMPTS = 5;

/**
 * @typedef {Object} InputUserData
 * @property {string} phoneNumber
 * @property {pkg.$Enums.Role} role
 * @property {string} firstName
 * @property {string} middleName
 * @property {string} lastName
 * @property {Buffer} [profileImageBuffer]
 */

/**
 * @typedef {Object} InputWorkerData
 * @property {boolean} isInTeam
 * @property {number} experienceYears
 * @property {boolean} acceptsUrgentJobs
 * @property {import('../repositories/database/Repository.js').IDType[]} workGovernmentIds
 * @property {{ mainId: import('../repositories/database/Repository.js').IDType, subIds: import('../repositories/database/Repository.js').IDType[] }[]} specializationsTree
 * @property {Buffer} idImageBuffer
 * @property {Buffer} profileWithIdImageBuffer
 */

/**
 * @typedef {Object} InputClientData
 * @property {string} address
 * @property {string} [addressNotes]
 * @property {import('../repositories/database/Repository.js').IDType} governmentId
 * @property {import('../repositories/database/Repository.js').IDType} cityId
 */

/**
 * Auth Service
 * @class
 * @extends Service
 */
export default class AuthService extends Service {
  /** @type {UserRepository} */
  #userRepository;
  /** @type {WorkerRepository} */
  #workerRepository;
  /** @type {ClientRepository} */
  #clientRepository;
  /** @type {GovernmentRepository} */
  #governmentRepository;
  /** @type {OtpCache} */
  #otpCache;
  /** @type {SessionRepository} */
  #sessionRepository;
  /** @type {RateLimitCache} */
  #rateLimitCache;

  /**
   * @param {Object} params
   * @param {UserRepository} params.userRepository
   * @param {WorkerRepository} params.workerRepository
   * @param {ClientRepository} params.clientRepository
   * @param {GovernmentRepository} params.governmentRepository
   * @param {OtpCache} params.otpCache
   * @param {SessionRepository} params.sessionRepository
   * @param {RateLimitCache} params.rateLimitCache
   */
  constructor({
    userRepository,
    workerRepository,
    clientRepository,
    governmentRepository,
    otpCache,
    sessionRepository,
    rateLimitCache,
  }) {
    super();
    this.#userRepository = userRepository;
    this.#workerRepository = workerRepository;
    this.#clientRepository = clientRepository;
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
   * @returns {Promise<{ user: import("../repositories/database/UserRepository.js").User, profile: import("@prisma/client").WorkerProfile }>}
   * @throws {AppError} If government or city not found
   */
  async registerWorker({
    userData: {
      phoneNumber,
      firstName,
      middleName,
      lastName,
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
      // Note: governmentId and cityId validation moved to location handling
      // For workers, government associations are handled via workGovernmentIds

      const user = await this.#userRepository.create({
        data: {
          phoneNumber,
          role,
          firstName,
          middleName,
          lastName,
          status: pkg.$Enums.AccountStatus.ACTIVE,
          workerProfile: {
            create: {
              experienceYears,
              isInTeam: Boolean(isInTeam),
              acceptsUrgentJobs: Boolean(acceptsUrgentJobs),
            },
          },
        },
      });

      const nationalID = (
        await uploadToCloudinary(
          idImageBuffer,
          `${user.id}/verification_info`,
          'nationalID'
        )
      ).url;

      const selfiWithID = (
        await uploadToCloudinary(
          profileWithIdImageBuffer,
          `${user.id}/verification_info`,
          'selfiWithID'
        )
      ).url;

      const workerProfile = await this.#workerRepository.findFirst({
        userId: user.id,
      });

      const verification =
        await this.#workerRepository.upsertVerification({
          workerProfileId: workerProfile.id,
          data: {
            workerProfile: { connect: { id: workerProfile.id } },
            idWithPersonalImageUrl: nationalID,
            idDocumentUrl: selfiWithID,
            status: pkg.$Enums.VerificationStatus.PENDING,
            reason: 'Waiting for verification',
          },
        });

      await this.#workerRepository.insertWorkingGovernments({
        userId: user.id,
        governmentIds: workGovernmentIds,
      });
      await this.#workerRepository.insertSpecializations({
        workerProfileId: workerProfile.id,
        specializationsTree,
      });

      const { url } = await uploadToCloudinary(
        profileImageBuffer,
        `${phoneNumber}/profile_image`,
        'profileMain'
      );

      const profile = await this.#workerRepository.findByUserId({
        userId: user.id,
      });

      await this.#userRepository.updateMany({
        where: { id: user.id },
        data: { profileImageUrl: url },
      });
      user.profileImageUrl = url;

      return { profile, user, verification };
    });
  }

  /**
   * Register a new client user
   * @async
   * @method registerClient
   * @param {Object} params - User registration data
   * @param {InputUserData} params.userData
   * @param {InputClientData} params.clientProfileData
   * @returns {Promise<{ user: import("../repositories/database/UserRepository.js").User, profile: import("@prisma/client").ClientProfile }>} Created user object
   * @throws {AppError} If government or city not found
   */
  async registerClient({
    userData: {
      firstName,
      middleName,
      lastName,
      phoneNumber,
      role,
      profileImageBuffer,
    },
    clientProfileData: { governmentId, cityId, address, addressNotes },
  }) {
    return tryCatch(async () => {
      // Note: governmentId and cityId validation moved to location handling
      // For clients, location data is handled separately via the Location model
      
      const government = await this.#governmentRepository.findFirst({ id: governmentId });

      if (!government) {
        throw new AppError('Government not found', 404);
      }

      const city = await this.#governmentRepository.findCity({ filter: { where: {id: cityId } } });

      if (!city) {
        throw new AppError('City not found', 404);
      }

      const user = await this.#userRepository.create({
        data: {
          phoneNumber,
          role,
          firstName,
          middleName,
          lastName,
          status: pkg.$Enums.AccountStatus.ACTIVE,
          clientProfile: {
            create: {
              locations: {
                create: {
                  government: { connect: { id: governmentId } },
                  city: { connect: { id: cityId } },
                  address,
                  addressNotes,
                  isMain: true,
                },
              },
            },
          },
        },
      });

      if (profileImageBuffer) {
        const { url } = await uploadToCloudinary(
          profileImageBuffer,
          `${user.id}/profile_image`,
          'profileMain'
        );

        await this.#userRepository.updateMany({
          data: { profileImageUrl: url },
          where: { id: user.id },
        });
        user.profileImageUrl = url;
      }

      const profile = await this.#clientRepository.findFirst({
        userId: user.id,
      });

      return { profile, user };
    });
  }

  /**
   * Request a new OTP for the given phone number
   * @async
   * @method requestOTP
   * @param {string} phoneNumber - User's phone number
   * @param {pkg.$Enums.Method} method - OTP delivery method (SMS or WhatsApp)
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
   * @param {pkg.$Enums.Method} method - OTP delivery method
   * @param {string} OTP - The OTP to validate (hashed)
   * @param {string} deviceId - The device identifier
   * @returns {Promise<{ tokenType: "register" | "login", token: string, workerShit: { isWorker: boolean, isWorkerSignedUp: boolean } | {}}>} Validation result
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

      let workerShit = {};
      if (tokenType === 'login') {
        const user = await this.#userRepository.findFirst({
          phoneNumber: phoneNumber,
        });

        const workProfile = await this.#workerRepository.findFirst({
          userId: user.id,
        });
        workerShit.isWorker = workProfile ? true : false;
        if (workerShit.isWorker) {
          const verification =
            await this.#workerRepository.findVerification({
              workerProfileId: workProfile.id,
            });
          workerShit.isWorkerSignedUp = verification.status === 'APPROVED';
        }
      } else {
        workerShit.isWorker = false;
        workerShit.isWorkerSignedUp = false;
      }

      return { tokenType, token, workerShit };
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
   * @param {pkg.$Enums.Role} params.role - User's role
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
   * @returns {Promise<{session: Object, user: Partial<import('@prisma/client').User>, unHashedRefreshToken: string}>} Created session and refresh token
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
      user: { connect: { id: user.id } },
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
