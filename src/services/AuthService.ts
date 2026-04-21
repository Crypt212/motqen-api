/**
 * @fileoverview User Service - Handle authentication
 * @module services/AuthService
 */

import { generateOTP, hashOTP } from '../utils/OTP.js';
import crypto from 'crypto';
import AppError from '../errors/AppError.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import Service, { tryCatch } from './Service.js';
import IOtpCache from '../cache/interfaces/otpCache.js';
import environment from '../configs/environment.js';
import SendOTPProvider from '../providers/SendOTPProvider.js';
import IRateLimitCache from '../cache/interfaces/RateLimitCache.js';
import ITokenCache from '../cache/interfaces/tokenCache.js';
import { generateToken, verifyAndDecodeToken } from '../utils/tokens.js';
import { logger } from '../libs/winston.js';
import { emitToUser } from '../socket/socket-emitter.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import IUserRepository from '../repositories/interfaces/UserRepository.js';
import IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import { Role, User } from '../domain/user.entity.js';
import { WorkerProfile, WorkerProfileVerification } from '../domain/workerProfile.entity.js';
import { ClientProfile } from '../domain/clientProfile.entity.js';
import IClientProfileRepository from '../repositories/interfaces/ClientRepository.js';
import { Method } from '../domain/otp.entity.js';
import { LoginTokenPayload, RegisterTokenPayload } from '../types/tokens.js';
import IGovernmentRepository from '../repositories/interfaces/GovernmentRepository.js';
import ISessionRepository from '../repositories/interfaces/SessionRepository.js';
import { Session } from '../domain/session.entity.js';
import { SpecializationsTree } from '../domain/specialization.entity.js';
import { OTPErrorDetails } from '../errors/appErrorDetails/OTPDetails.js';

import { transactionManager } from '../state.js';
import UserRepository from '../repositories/prisma/UserRepository.js';
import WorkerProfileRepository from '../repositories/prisma/WorkerRepository.js';
import ClientProfileRepository from '../repositories/prisma/ClientRepository.js';
import GovernmentRepository from '../repositories/prisma/GovernmentRepository.js';
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Convert JWT-style expiry string (e.g. '7d', '24h', '15m') to seconds
 */
function parseExpiryToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)(s|m|h|d|w)$/);
  if (!match) return 3600;
  const num = parseInt(match[1]);
  switch (match[2]) {
    case 's':
      return num;
    case 'm':
      return num * 60;
    case 'h':
      return num * 60 * 60;
    case 'd':
      return num * 60 * 60 * 24;
    case 'w':
      return num * 60 * 60 * 24 * 7;
    default:
      return 3600;
  }
}

interface InputUserType {
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImageBuffer: Buffer;
  location: {
    governmentId: IDType;
    cityId: IDType;
    address: string;
    addressNotes: string;
    long: number;
    lat: number;
  };
}

interface InputWorkerType {
  isInTeam: boolean;
  experienceYears: number;
  acceptsUrgentJobs: boolean;
  workGovernmentIds: IDType[];
  specializationsTree: SpecializationsTree;
  idImageBuffer: Buffer;
  profileWithIdImageBuffer: Buffer;
}

interface InputClientType {}

/**
 * Auth Service
 * @class
 * @extends Service
 */
export default class AuthService extends Service {
  private userRepository: IUserRepository;
  private workerProfileRepository: IWorkerProfileRepository;
  private sessionRepository: ISessionRepository;
  private rateLimitCache: IRateLimitCache;
  private otpCache: IOtpCache;
  private tokenCache: ITokenCache;

  /**
   */
  constructor(params: {
    userRepository: IUserRepository;
    workerProfileRepository: IWorkerProfileRepository;
    sessionRepository: ISessionRepository;
    rateLimitCache: IRateLimitCache;
    otpCache: IOtpCache;
    tokenCache: ITokenCache;
  }) {
    super();
    this.userRepository = params.userRepository;
    this.workerProfileRepository = params.workerProfileRepository;
    this.sessionRepository = params.sessionRepository;
    this.rateLimitCache = params.rateLimitCache;
    this.otpCache = params.otpCache;
    this.tokenCache = params.tokenCache;
  }

  /**
   * Register a new worker user
   * @throws {AppError} If government or city not found
   */
  async registerWorker(
    { firstName, middleName, lastName, phoneNumber, profileImageBuffer, location }: InputUserType,
    {
      experienceYears,
      isInTeam,
      specializationsTree: specializations,
      acceptsUrgentJobs,
      idImageBuffer,
      profileWithIdImageBuffer,
      workGovernmentIds,
    }: InputWorkerType
  ): Promise<{ user: User; profile: WorkerProfile; verification: WorkerProfileVerification }> {
    return tryCatch(async () => {
      const userCreationTransactionResult = await transactionManager.execute(
        { userRepo: UserRepository, workerRepo: WorkerProfileRepository },
        async ({ userRepo, workerRepo }) => {
          const user = await userRepo.create({
            user: {
              phoneNumber,
              role: 'USER',
              firstName,
              middleName,
              lastName,
              status: 'ACTIVE',
            },
          });

          await userRepo.addLocation({
            userId: user.id,
            location: {
              ...location,
              isMain: true,
            },
          });

          const profile = await workerRepo.create({
            userId: user.id,
            workerProfile: {
              experienceYears,
              isInTeam: Boolean(isInTeam),
              acceptsUrgentJobs: Boolean(acceptsUrgentJobs),
            },
          });

          await workerRepo.insertWorkGovernments({
            workerFilter: {
              userId: user.id,
            },
            governmentIds: workGovernmentIds,
          });
          await workerRepo.insertSubSpecializations({
            workerFilter: {
              userId: user.id,
            },
            specializationsTree: specializations,
          });

          return { profile, user };
        }
      );

      const { profile, user } = userCreationTransactionResult;

      const { url: profileImageUrl } = await uploadToCloudinary(
        profileImageBuffer,
        `${phoneNumber}/profile_image`,
        'profileMain'
      );

      const { url: nationalIDImageUrl } = await uploadToCloudinary(
        idImageBuffer,
        `${user.id}/verification_info`,
        'nationalID'
      );

      const { url: selfiWithIDImageUrl } = await uploadToCloudinary(
        profileWithIdImageBuffer,
        `${user.id}/verification_info`,
        'selfiWithID'
      );

      const verificationCreationTransactionResult = await transactionManager.execute(
        { userRepo: UserRepository, workerRepo: WorkerProfileRepository },
        async ({ userRepo, workerRepo }) => {
          await userRepo.update({
            filter: {
              id: user.id,
            },
            user: { profileImageUrl: profileImageUrl },
          });
          user.profileImageUrl = profileImageUrl;

          await workerRepo.find({ workerFilter: { userId: user.id } });

          const verification = await workerRepo.setVerification({
            workerProfileId: profile.id,
            verification: {
              idWithPersonalImageUrl: nationalIDImageUrl,
              idDocumentUrl: selfiWithIDImageUrl,
              status: 'PENDING',
              reason: 'Waiting for verification',
            },
          });
          return { verification };
        }
      );

      return { user, profile, verification: verificationCreationTransactionResult.verification };
    });
  }

  /**
   * Register a new client user
   * @async
   * @method registerClient
   * @returns {Promise<{ user: import("../repositories/database/UserRepository.js").User, profile: import("../generated/prisma/client.js").ClientProfile }>} Created user object
   * @throws {AppError} If government or city not found
   */
  async registerClient(
    { firstName, middleName, lastName, phoneNumber, profileImageBuffer, location }: InputUserType,
    {}: InputClientType
  ): Promise<{ user: User; profile: ClientProfile }> {
    return tryCatch(async () => {
      const creationTransactionResult = await transactionManager.execute(
        {
          userRepo: UserRepository,
          clientRepo: ClientProfileRepository,
          govRepo: GovernmentRepository,
        },
        async ({ userRepo, clientRepo, govRepo }) => {
          const government = await govRepo.find({
            filter: { id: location.governmentId },
          });
          if (!government) throw new AppError('Government not found', 404);

          const city = await govRepo.findCity({ filter: { id: location.cityId } });
          if (!city) throw new AppError('City not found', 404);

          const user = await userRepo.create({
            user: {
              phoneNumber,
              role: 'USER',
              firstName,
              middleName,
              lastName,
              status: 'ACTIVE',
            },
          });

          // Create bare client profile
          await clientRepo.create({
            userId: user.id,
            clientProfile: {},
          });

          // Add primary location to the User
          await userRepo.addLocation({
            userId: user.id,
            location: {
              ...location,
              isMain: true,
            },
          });

          const profile = await clientRepo.find({
            filter: { userId: user.id },
          });

          return { profile: profile!, user };
        }
      );

      const { user, profile } = creationTransactionResult;

      if (profileImageBuffer) {
        const { url } = await uploadToCloudinary(
          profileImageBuffer,
          `${user.id}/profile_image`,
          'profileMain'
        );

        await transactionManager.execute(
          { userRepo: UserRepository, clientRepo: ClientProfileRepository },
          async ({ userRepo }) => {
            await userRepo.update({
              filter: {
                id: user.id,
              },
              user: { profileImageUrl: url },
            });
            user.profileImageUrl = url;
          }
        );
      }

      return { user, profile };
    });
  }

  /**
   * Request a new OTP for the given phone number
   * @description Generates a new OTP and sends it via the specified method
   */
  async requestOTP(phoneNumber: string, method: Method): Promise<boolean> {
    const OTP = generateOTP();
    const hashedOTP = hashOTP(OTP);

    await this.otpCache.setOtp(phoneNumber, method, hashedOTP, environment.otps.expiresIn);

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
  async verifyOTP(
    phoneNumber: string,
    method: Method,
    OTP: string,
    deviceId: IDType
  ): Promise<{
    tokenType: 'register' | 'login';
    token: string;
    workerVerificationInfo: { isWorker: boolean; isWorkerSignedUp: boolean } | {};
  }> {
    // in production -> Invalid or expired OTP only

    const currentAttempts = await this.rateLimitCache.getVerifyAttempts(phoneNumber, method);
    if (currentAttempts >= MAX_VERIFY_ATTEMPTS) {
      throw new AppError(
        'Maximum verification attempts reached',
        400,
        new OTPErrorDetails({
          type: 'FAILED_ATTEMPT',
          remainingAttempts: 0,
          requestNewOtp: true,
        })
      );
    }

    try {
      const hashedOTP = hashOTP(OTP);

      if (!OTP)
        throw new AppError(
          'OTP is not provided',
          422,
          new OTPErrorDetails({ type: 'FAILED_ATTEMPT' })
        );

      const otp = await this.otpCache.getOtp(phoneNumber, method);

      if (!otp || hashedOTP !== otp)
        throw new AppError(
          "OTP is expired or doesn't match",
          400,
          new OTPErrorDetails({ type: 'FAILED_ATTEMPT' })
        );

      await this.otpCache.deleteOtp(phoneNumber, method);

      await this.rateLimitCache.resetAfterSuccess(phoneNumber, method, deviceId);
      const user = await this.userRepository.find({ filter: { phoneNumber } });

      let token: string;
      let tokenType: 'register' | 'login';
      if (user) {
        const payload: LoginTokenPayload = { type: 'login', phoneNumber };
        tokenType = 'login';
        token = generateToken(payload);
      } else {
        const payload: RegisterTokenPayload = { type: 'register', phoneNumber };
        tokenType = 'register';
        token = generateToken(payload);
      }

      // Store token hash in Redis so it can only be consumed once
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const ttlSeconds = parseExpiryToSeconds(environment.jwt[tokenType].expiresIn);
      const stored = await this.tokenCache.setToken(tokenType, tokenHash, ttlSeconds);
      if (!stored) {
        throw new AppError('Token already issued for this session, please request a new OTP', 409);
      }

      let workerVerificationInfo: { isWorker: boolean; isWorkerSignedUp: boolean } = {
        isWorker: false,
        isWorkerSignedUp: false,
      };
      if (tokenType === 'login') {
        const workProfile = await this.workerProfileRepository.find({
          workerFilter: { userId: user.id },
        });
        workerVerificationInfo.isWorker = workProfile ? true : false;
        if (workerVerificationInfo.isWorker) {
          const verification = await this.workerProfileRepository.findVerification({
            workerFilter: { userId: user.id },
          });
          if (!verification) {
            workerVerificationInfo.isWorkerSignedUp = false;
          } else {
            workerVerificationInfo.isWorkerSignedUp = verification.status === 'APPROVED';
          }
        }
      } else {
        workerVerificationInfo.isWorker = false;
        workerVerificationInfo.isWorkerSignedUp = false;
      }

      return { tokenType, token, workerVerificationInfo: workerVerificationInfo };
    } catch (error: unknown) {
      if (!(error instanceof AppError && error.details && error.details instanceof OTPErrorDetails))
        throw error;
      const record = await this.rateLimitCache.incrementVerify(phoneNumber, method);

      const limitStatus = {
        attempts: record.attempts,
        remaining: Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts),
        blocked: record.attempts >= MAX_VERIFY_ATTEMPTS,
      };

      throw new AppError(
        error.message,
        400,
        new OTPErrorDetails({
          type: 'FAILED_ATTEMPT',
          remainingAttempts: limitStatus.remaining,
          requestNewOtp: limitStatus.blocked,
        })
      );
    }
  }

  /**
   * Generates a new access token based on the provided refresh token.
   * @throws {AppError} If refresh token is invalid, revoked, or expired
   */
  async generateAccessToken(params: {
    refreshToken: string;
    deviceId: IDType;
    userId: IDType;
    role: Role;
  }): Promise<string> {
    const hashedToken = crypto.createHash('sha256').update(params.refreshToken).digest('hex');

    const session = await this.sessionRepository.find({
      filter: {
        userId: params.userId,
        deviceId: params.deviceId,
        token: hashedToken,
      },
    });

    if (!session) {
      throw new AppError('Invalid or Expired refresh token', 400);
    }
    if (session.isRevoked) {
      throw new AppError('Refresh token has been revoked', 400);
    }
    if (session.expiresAt.getTime() < Date.now()) {
      await this.sessionRepository.revoke({
        filter: { id: session.id },
        revokedBy: params.userId,
      });
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
   * @description Creates a new session, revokes existing ones for the same user and device
   */
  async login(params: {
    phoneNumber: string;
    deviceId: IDType;
    expiresAt: Date;
  }): Promise<{ session: Session; user: User; unHashedRefreshToken: string }> {
    const user = await this.userRepository.find({ filter: { phoneNumber: params.phoneNumber } });

    const unHashedRefreshToken = generateToken({
      type: 'refresh',
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    logger.info('Generated Refresh Token:', params.expiresAt);

    const hashedToken = crypto.createHash('sha256').update(unHashedRefreshToken).digest('hex');

    const session = await this.sessionRepository.create({
      userId: user.id,
      session: {
        isRevoked: false,
        lastUsedAt: new Date(Date.now()),
        deviceId: params.deviceId,
        expiresAt: params.expiresAt,
        token: hashedToken,
      },
    });

    // Revoke ALL existing sessions for this user except the new one (single session per user)
    await this.sessionRepository.revokeMany({
      filter: { userId: user.id },
      revokedBy: session.id,
      excludeId: session.id,
    });

    // Notify the user that all other sessions have been revoked
    emitToUser(user.id, 'session_revoked', {
      reason: 'new_login',
      message: 'You have been logged out because a new session was started on another device',
    });

    return { session, user, unHashedRefreshToken: unHashedRefreshToken };
  }

  /**
   * Verify a register token and atomically consume it (one-time use).
   * Rolls back Redis consumption if JWT verification fails.
   * @throws {AppError} If token is invalid, already used, or expired
   */
  async consumeRegisterToken(token: string): Promise<RegisterTokenPayload> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const consumed = await this.tokenCache.consumeToken('register', tokenHash);
    if (!consumed) {
      throw new AppError('Register token already used or expired', 401);
    }

    try {
      const decoded = verifyAndDecodeToken(token, 'register');
      return decoded;
    } catch (error) {
      // Rollback: restore token to Redis so it can be retried
      const ttlSeconds = parseExpiryToSeconds(environment.jwt.register.expiresIn);
      await this.tokenCache.restoreToken('register', tokenHash, ttlSeconds);
      throw error;
    }
  }

  /**
   * Verify a login token and atomically consume it (one-time use).
   * Rolls back Redis consumption if JWT verification fails.
   * @throws {AppError} If token is invalid, already used, or expired
   */
  async consumeLoginToken(token: string): Promise<LoginTokenPayload> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const consumed = await this.tokenCache.consumeToken('login', tokenHash);
    if (!consumed) {
      throw new AppError('Login token already used or expired', 401);
    }

    try {
      const decoded = verifyAndDecodeToken(token, 'login');
      return decoded;
    } catch (error) {
      // Rollback: restore token to Redis so it can be retried
      const ttlSeconds = parseExpiryToSeconds(environment.jwt.login.expiresIn);
      await this.tokenCache.restoreToken('login', tokenHash, ttlSeconds);
      throw error;
    }
  }

  /**
   * Revokes all sessions for a given user ID and device fingerprint.
   */
  async logout(params: { userId: IDType; deviceId: string }): Promise<void> {
    try {
      await this.sessionRepository.revoke({
        filter: {
          userId: params.userId,
          deviceId: params.deviceId,
        },
        revokedBy: params.userId,
      });
    } catch (err) {
      logger.error('Failed to revoke session:', err);
      throw err;
    }
  }
}
