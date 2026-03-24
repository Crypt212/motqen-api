import { generateOTP, hashOTP } from '../utils/OTP.js';

/**
 * @fileoverview User Service - Handle authentication
 * @module services/AuthService
 */

import crypto from 'crypto';
import AppError from '../errors/AppError.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import Service, { tryCatch } from './Service.js';
import IOtpCache from '../cache/interfaces/otpCache.js';
import environment from '../configs/environment.js';
import SendOTPProvider from '../providers/SendOTPProvider.js';
import IRateLimitCache from '../cache/interfaces/RateLimitCache.js';
import { generateToken } from '../utils/tokens.js';
import { logger } from '../libs/winston.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import IUserRepository from '../repositories/interfaces/UserRepository.js';
import IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import { Role, User } from '../domain/user.entity.js';
import { WorkerProfile } from '../domain/workerProfile.entity.js';
import { ClientProfile } from '../domain/clientProfile.entity.js';
import IClientProfileRepository from '../repositories/interfaces/ClientRepository.js';
import { Method } from '../domain/otp.entity.js';
import { LoginTokenPayload, RegisterTokenPayload } from '../types/tokens.js';
import IGovernmentRepository from '../repositories/interfaces/GovernmentRepository.js';
import ISessionRepository from '../repositories/interfaces/SessionRepository.js';
import { Session } from '../domain/session.entity.js';
import { SpecializationsTree } from '../domain/specialization.entity.js';

const MAX_VERIFY_ATTEMPTS = 5;

interface InputUserType {
  phoneNumber: string,
  firstName: string,
  middleName: string,
  lastName: string,
  profileImageBuffer: Buffer
}

interface InputWorkerType {
  isInTeam: boolean,
  experienceYears: number,
  acceptsUrgentJobs: boolean,
  workGovernmentIds: IDType[],
  specializationsTree: SpecializationsTree,
  idImageBuffer: Buffer,
  profileWithIdImageBuffer: Buffer,
}

interface InputClientType {
  address: string,
  addressNotes: string,
  governmentId: IDType,
  cityId: IDType,
}

/**
 * Auth Service
 * @class
 * @extends Service
 */
export default class AuthService extends Service {
    private userRepository: IUserRepository
    private workerProfileRepository: IWorkerProfileRepository
    private clientProfileRepository: IClientProfileRepository
    private governmentRepository: IGovernmentRepository
    private sessionRepository: ISessionRepository
    private rateLimitCache: IRateLimitCache
    private otpCache: IOtpCache

  /**
   */
  constructor(params: {
    userRepository: IUserRepository,
    workerProfileRepository: IWorkerProfileRepository,
    clientProfileRepository: IClientProfileRepository,
    governmentRepository: IGovernmentRepository,
    sessionRepository: ISessionRepository,
    rateLimitCache: IRateLimitCache,
    otpCache: IOtpCache,
  }) {
    super();
    this.userRepository = params.userRepository;
    this.workerProfileRepository= params.workerProfileRepository;
    this.clientProfileRepository= params.clientProfileRepository;
    this.governmentRepository= params.governmentRepository;
    this.sessionRepository= params.sessionRepository;
    this.rateLimitCache= params.rateLimitCache;
    this.otpCache= params.otpCache;
  }

  /**
   * Register a new worker user
   * @throws {AppError} If government or city not found
   */
  async registerWorker(
    {
      phoneNumber,
      firstName,
      middleName,
      lastName,
      profileImageBuffer,
    }: InputUserType,
    {
      idImageBuffer,
      profileWithIdImageBuffer,
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      specializationsTree,
      workGovernmentIds,
    }: InputWorkerType,
  ): Promise<{ user: User, profile: WorkerProfile }> {
    return tryCatch(async () => {
      // Note: governmentId and cityId validation moved to location handling
      // For workers, government associations are handled via workGovernmentIds

      const user = await this.userRepository.create({
        user: {
          phoneNumber,
          role: "USER",
          firstName,
          middleName,
          lastName,
          status: "ACTIVE",
        }
      });
      const profile = await this.workerProfileRepository.create({
        userId: user.id,
        workerProfile: {
          experienceYears,
          isInTeam: Boolean(isInTeam),
          acceptsUrgentJobs: Boolean(acceptsUrgentJobs),
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

      await this.workerProfileRepository.find({ filter: { userId: user.id }, });

      const verification =
        await this.workerProfileRepository.setVerification({
          workerProfileId: profile.id,
          verification: {
            idWithPersonalImageUrl: nationalID,
            idDocumentUrl: selfiWithID,
            status: "PENDING",
            reason: 'Waiting for verification',
          },
        });

      await this.workerProfileRepository.insertWorkGovernments({
        filter: {
          userId: user.id,
        },
        governmentIds: workGovernmentIds,
      });
      await this.workerProfileRepository.insertSubSpecializations({
        filter: {
          userId: user.id,
        },
        specializationsTree,
      });

      const { url } = await uploadToCloudinary(
        profileImageBuffer,
        `${phoneNumber}/profile_image`,
        'profileMain'
      );

      await this.userRepository.update({
        filter: {
          id: user.id,
        },
        user: { profileImageUrl: url },
      });
      user.profileImageUrl = url;

      return { profile, user, verification };
    });
  }

  /**
   * Register a new client user
   * @async
   * @method registerClient
   * @returns {Promise<{ user: import("../repositories/database/UserRepository.js").User, profile: import("@prisma/client").ClientProfile }>} Created user object
   * @throws {AppError} If government or city not found
   */
  async registerClient(
    {
      firstName,
      middleName,
      lastName,
      phoneNumber,
      profileImageBuffer,
    }: InputUserType,
    { governmentId, cityId, address, addressNotes }: InputClientType,
  ): Promise<{ user: User, profile: ClientProfile }> {
    return tryCatch(async () => {
      // Note: governmentId and cityId validation moved to location handling
      // For clients, location data is handled separately via the Location model

      const government = await this.governmentRepository.find({ filter: { id: governmentId } });

      if (!government) {
        throw new AppError('Government not found', 404);
      }

      const city = await this.governmentRepository.findCity({ filter: { id: cityId } });

      if (!city) {
        throw new AppError('City not found', 404);
      }

      const user = await this.userRepository.create({
        user: {
          phoneNumber,
          role: "USER",
          firstName,
          middleName,
          lastName,
          status: "ACTIVE",
        },
      });

      await this.clientProfileRepository.createWithPrimaryLocation({
        userId: user.id,
        clientProfile: {},
        location: {
          governmentId,
          cityId,
          address,
          addressNotes,
          isMain: true,
        },
      });

      if (profileImageBuffer) {
        const { url } = await uploadToCloudinary(
          profileImageBuffer,
          `${user.id}/profile_image`,
          'profileMain'
        );

        await this.userRepository.update({
          filter: {
            id: user.id,
          },
          user: { profileImageUrl: url },
        });
        user.profileImageUrl = url;
      }

      const profile = await this.clientProfileRepository.findWithPrimaryLocation({ filter: { userId: user.id } });

      return { profile, user };
    });
  }

  /**
   * Request a new OTP for the given phone number
   * @description Generates a new OTP and sends it via the specified method
   */
  async requestOTP(phoneNumber: string, method: Method): Promise<boolean> {
    const OTP = generateOTP();
    const hashedOTP = hashOTP(OTP);

    await this.otpCache.setOtp(
      phoneNumber,
      method,
      hashedOTP,
      environment.otps.expiresIn
    );

    await SendOTPProvider(method, OTP, phoneNumber);

    // Reset verify attempts so user gets 5 fresh attempts on the new code
    if (environment.nodeEnv !== 'development')
      await this.rateLimitCache.resetVerifyAttempts(phoneNumber, method);

    return true;
  }

  /**
   * Validate an OTP
   * @description Checks if the provided OTP is valid and not expired
   */
  async verifyOTP(phoneNumber: string, method: Method, OTP: string, deviceId: IDType): Promise<{ tokenType: "register" | "login", token: string, workerShit: { isWorker: boolean, isWorkerSignedUp: boolean } | {} }> {
    // in production -> Invalid or expired OTP only

    try {
      const hashedOTP = hashOTP(OTP);

      if (!OTP) throw new AppError('OTP is not provided', 422, { type: 'OTP' });

      const otp = await this.otpCache.getOtp(phoneNumber, method);

      if (!otp || hashedOTP !== otp)
        throw new AppError("OTP is expired or doesn't match", 400, {
          type: 'OTP',
        });

      await this.otpCache.deleteOtp(phoneNumber, method);

      await this.rateLimitCache.incrementVerify(phoneNumber, method);

      await this.rateLimitCache.resetAfterSuccess(
        phoneNumber,
        method,
        deviceId
      );
      const user = await this.userRepository.find({ filter: { phoneNumber } });

      let token: string;
      let tokenType: "register" | "login";
      if (user) {
        const payload: LoginTokenPayload = { type: 'login', phoneNumber };
        tokenType = 'login';
        token = generateToken(payload);
      } else {
        const payload: RegisterTokenPayload = { type: 'register', phoneNumber };
        tokenType = 'register';
        token = generateToken(payload);
      }

      let workerShit: { isWorker: boolean, isWorkerSignedUp: boolean } = { isWorker: false, isWorkerSignedUp: false };
      if (tokenType === 'login') {
        const user = await this.userRepository.find({ filter: { phoneNumber: phoneNumber, } });
        const workProfile = await this.workerProfileRepository.find({ filter: { userId: user.id, } });
        workerShit.isWorker = workProfile ? true : false;
        if (workerShit.isWorker) {
          const verification = await this.workerProfileRepository.findVerification({ filter: { userId: user.id, } });
          workerShit.isWorkerSignedUp = verification.status === "APPROVED";
        }
      } else {
        workerShit.isWorker = false;
        workerShit.isWorkerSignedUp = false;
      }

      return { tokenType, token, workerShit };
    } catch (error) {
      if (!(error instanceof AppError && error.errors.type === 'OTP'))
        throw error;
      const record = await this.rateLimitCache.incrementVerify(
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
   * @throws {AppError} If refresh token is invalid, revoked, or expired
   */
  async generateAccessToken(params: { refreshToken: string, deviceId: IDType, userId: IDType, role: Role }): Promise<string> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(params.refreshToken)
      .digest('hex');

    const session = await this.sessionRepository.find({
      filter: {
        userId: params.userId,
        deviceId: params.deviceId,
        token: hashedToken,
      }
    });

    if (!session) {
      throw new AppError('Invalid or Expired refresh token', 400);
    }
    if (session.isRevoked) {
      throw new AppError('Refresh token has been revoked', 400);
    }
    if (session.expiresAt.getTime() < Date.now()) {
      await this.sessionRepository.delete({ filter: { id: session.id } });
      throw new AppError('Refresh token has expired', 400);
    }

    const user = await this.userRepository.find({ filter: { id: params.userId } });

    const accessToken = generateToken({
      type: 'access',
      userId: params.userId,
      role: params.role,
      phoneNumber: user.phoneNumber,
    });
    return accessToken;
  }

  /**
   * Creates a new refresh token for the given user ID and device fingerprint.
   * @description Creates a new session, revokes existing ones for the same device
   */
  async login(params: { phoneNumber: string, deviceId: IDType, expiresAt: Date }): Promise<{ session: Session, user: User, unHashedRefreshToken: string }> {
    await this.sessionRepository.delete({ filter: { deviceId: params.deviceId } });
    const user = await this.userRepository.find({ filter: { phoneNumber: params.phoneNumber }, });
    const unHashedRefreshToken = generateToken({
      type: 'refresh',
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    logger.info('Generated Refresh Token:', params.expiresAt);

    const hashedToken = crypto
      .createHash('sha256')
      .update(unHashedRefreshToken)
      .digest('hex');

    const session = await this.sessionRepository.create({
      userId: user.id,
      session: {
        isRevoked: false,
        lastUsedAt: new Date(Date.now()),
        deviceId: params.deviceId,
        expiresAt: params.expiresAt,
        token: hashedToken,
      }
    });
    return { session, user, unHashedRefreshToken: unHashedRefreshToken };
  }

  /**
   * Revokes all sessions for a given user ID and device fingerprint.
   */
  async logout(params: { userId: IDType, deviceId: string }): Promise<void> {
    try {
      await this.sessionRepository.delete({
        filter: {
          userId: params.userId,
          deviceId: params.deviceId,
        }
      });
    } catch (err) {
      logger.error('Failed to revoke session:', err);
      throw err;
    }
  }
}
