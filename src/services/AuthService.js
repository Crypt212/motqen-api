import { generateOTP, hashOTP } from "../utils/OTP.js";

/**
 * @fileoverview User Service - Handle authentication
 * @module services/AuthService
 */

import crypto from "crypto";
import AppError from "../errors/AppError.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";
import Service, { tryCatch } from "./Service.js";
import OtpCache from "../repositories/cache/OTPCache.js";
import SessionRepository from "../repositories/database/SessionRepository.js";
import UserRepository from "../repositories/database/UserRepository.js";
import environment from "../configs/environment.js";
import SendOTPProvider from "../providers/SendOTPProvider.js";
import { $Enums } from "@prisma/client";
import RateLimitCache from "../repositories/cache/RateLimitCache.js";
import { Repository } from "../repositories/database/Repository.js";
import { generateToken } from "../utils/tokens.js";
import { logger } from "../libs/winston.js";

const MAX_VERIFY_ATTEMPTS = 5;

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
  /** @type {RateLimitCache} */
  #rateLimitCache;

  /**
   * @param {UserRepository} userRepository
   * @param {OtpCache} otpCache
   * @param {SessionRepository} sessionCache
   * @param {RateLimitCache} rateLimitCache
   */
  constructor(userRepository, otpCache, sessionCache, rateLimitCache) {
    super();
    this.#userRepository = userRepository;
    this.#otpCache = otpCache;
    this.#sessionRepository = sessionCache;
    this.#rateLimitCache = rateLimitCache;
  }

  /**
   * Register a new worker user
   * @async
   * @method registerWorker
   * @param {Object} params - User registration data
   * @param {string} params.phoneNumber - User's phone number
   * @param {string} params.firstName - User's first name
   * @param {string} params.middleName - User's middle name
   * @param {string} params.lastName - User's last name
   * @param {string} params.governmentId - Government ID
   * @param {string} params.city - City name
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} params.profileImage - Profile image URL
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} params.idImage - ID image URL
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} params.profileWithIdImage - Profile with ID image URL
   * @param {boolean} params.isInTeam - Whether the worker is in a team
   * @param {number} params.experienceYears - Experience years
   * @param {boolean} params.acceptsUrgentJobs - Whether the worker accepts urgent jobs
   * @param {{ mainId: string, subIds: string[] }[]} params.specializationsTree - Tree of main specialization and sub specializations
   * @param {string[]} params.workGovernmentIds - Government IDs that the worker works in
   * @returns {Promise<Object>} Created user object
   * @throws {AppError} If government or city not found
   */
  async registerWorker({
    phoneNumber,
    firstName,
    middleName,
    lastName,
    governmentId,
    city,
    profileImage,
    idImage,
    profileWithIdImage,
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationsTree,
    workGovernmentIds,
  }) {
    return tryCatch(async () => {
      /** @type {import('../types/role.js').Role} */
      const role = 'USER';


      const  { profile, user, verification } = await Repository.createTransaction([this.#userRepository], async () => {

        // const cityEntity = await governmentRepository.existsCity({ name: city, governmentId });
        // const cityEntities = await governmentRepository.findCities({});
        // const cityId = cityEntities[0].id;
        // if(!cityEntity){
        //   throw new AppError("Government or City not found", 400);
        // }

        const { user, profile } = await this.#userRepository.createWorker(
          {
            phoneNumber,
            role,
            firstName,
            middleName,
            lastName,
            governmentId,
            cityName: city,
            status: "ACTIVE"
          },
          {
            experienceYears,
            isInTeam:Boolean(isInTeam),
            acceptsUrgentJobs:Boolean(acceptsUrgentJobs),
          });
          
          /** @type {string} */
          
        const nationalID = (await uploadToCloudinary(idImage[0].buffer, `${user.id}/verification_info`, "nationalID")).url;
        /** @type {string} */
          

        const selfiWithID = (await uploadToCloudinary(profileWithIdImage[0].buffer, `${user.id}/verification_info`, "selfiWithID")).url;
        
        const verification = await this.#userRepository.addVerificationInfo(user.id, {
          idWithPersonalImageUrl: nationalID,
          idDocumentUrl: selfiWithID,
          status: "APPROVED"// until dashboard emplement
        });

        await this.#userRepository.addWorkerProfileGovernments(profile.id, workGovernmentIds);
        await this.#userRepository.addWorkerProfileSpecializations(profile.id, specializationsTree.map(({ mainId }) => mainId));
        for (let { mainId, subIds } of specializationsTree) {
          await this.#userRepository.addWorkerProfileSubSpecializations(profile.id, mainId, subIds);
        }
        return { profile, user, verification };
      }, (reason) => {
        console.log(reason)
        throw new AppError("Failed to create worker profile", 500, reason);
      });
      const {url} = (await uploadToCloudinary(profileImage.buffer, `${phoneNumber}/profile_image`, "profileMain"))
        await this.#userRepository.update({ profileImageUrl: url }, { id: user.id });
        user.profileImageUrl = url;
        return { profile, user, verification }
    });
  }

  /**
   * Register a new client user
   * @async
   * @method registerClient
   * @param {Object} params - User registration data
   * @param {string} params.phoneNumber - User's phone number
   * @param {string} params.firstName - User's first name
   * @param {string} params.middleName - User's middle name
   * @param {string} params.lastName - User's last name
   * @param {string} params.city - City name
   * @param {string} params.governmentId - Government ID
   * @param {string} params.address - Address of user
   * @param {string | undefined} params.addressNotes - Additional address information
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} params.profileImage - Profile image URL
   * @returns {Promise<{ user: import("@prisma/client").User, profile: import("@prisma/client").ClientProfile }>} Created user object
   * @throws {AppError} If government or city not found
   */
  async registerClient({
    phoneNumber,
    firstName,
    middleName,
    lastName,
    city,
    governmentId,
    address,
    addressNotes,
    profileImage = null,
  }) {
    return tryCatch(async () => {
      /** @type {import('../types/role.js').Role} */
      const role = 'USER';


      const { profile, user } =  await Repository.createTransaction([this.#userRepository], async () => {

        // const cityEntity = await governmentRepository.existsCity({ name: city, governmentId });
        // const cityEntities = await governmentRepository.findCities({});
        // const cityId = cityEntities[0].id;
        // if(!cityEntity){
        //   throw new AppError("Government or City not found", 400);
        // }

        const { user, profile } = await this.#userRepository.createClient(
          {
            phoneNumber,
            role,
            firstName,
            middleName,
            lastName,
            governmentId,
            cityName: city,
            status: "ACTIVE"
          },
          {
            address,
            addressNotes
          });


        return { profile, user };
      }, (reason) => {
        console.log(reason)
        throw new AppError("Failed to create client profile", 500, reason);
      });
      if (profileImage) {
      
        const  {url}  = await uploadToCloudinary(profileImage.buffer, `${user.id}/profile_image`, "profileMain");

        await this.#userRepository.update({ profileImageUrl: url }, { id: user.id });
        user.profileImageUrl = url
      }
      return { profile, user }
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
    console.log(OTP);
    const hashedOTP = hashOTP(OTP);

    await this.#otpCache.setOtp(phoneNumber, method, hashedOTP, environment.otps.expiresIn);

    await SendOTPProvider(method, OTP, phoneNumber);

    // Reset verify attempts so user gets 5 fresh attempts on the new code
    await this.#rateLimitCache.resetVerifyAttempts(phoneNumber, method);

    return true;
  };

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

    return await Repository.createTransaction([this.#userRepository], async () => {
      const hashedOTP = hashOTP(OTP);

      if (!OTP)
        throw new AppError("OTP is not provided", 400, { type: "OTP" });

      const otp = await this.#otpCache.getOtp(phoneNumber, method);


      if (!otp || hashedOTP !== otp)
        throw new AppError("OTP is not provided", 400, { type: "OTP" });

      await this.#otpCache.deleteOtp(phoneNumber, method);

      await this.#rateLimitCache.incrementVerify(phoneNumber, method);

      await this.#rateLimitCache.resetAfterSuccess(phoneNumber, method, deviceId);
      const user = await this.#userRepository.findOne({ phoneNumber });

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

    }, async (error) => {
      if (!(error instanceof AppError && error.errors.type === "OTP"))
        throw error;
      const record = await this.#rateLimitCache.incrementVerify(phoneNumber, method);

      const limitStatus = {
        attempts: record.attempts,
        remaining: Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts),
        blocked: record.attempts >= MAX_VERIFY_ATTEMPTS,
      };

      throw new AppError(error.message, 400, {
        remainingAttempts: limitStatus.remaining,
        requestNewOtp: limitStatus.blocked,
      });
    });
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
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await this.#sessionRepository.findOne({
      userId,
      deviceId: deviceId,
      token: hashedToken,
    });

    if (!session) {
      throw new AppError("Invalid or Expired refresh token", 400);
    }
    if (session.isRevoked) {
      throw new AppError("Refresh token has been revoked", 400,);
    }
    if (session.expiresAt.getTime() < Date.now()) {
      await this.#sessionRepository.delete({ id: session.id });
      throw new AppError("Refresh token has expired", 400);
    }

    const user = await this.#userRepository.findOne({ id: userId });
    const isWorker = await this.#userRepository.hasWorkerProfile(userId);
    const isClient = await this.#userRepository.hasClientProfile(userId);

    const accessToken = generateToken({
      type: "access",
      userId,
      role: role,
      phoneNumber: user.phoneNumber,
      isWorker,
      isClient,
      isActive: user.status == "ACTIVE",
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
  async login({
    phoneNumber,
    deviceId: deviceFingerprint,
    expiresAt,
  }) {
    await this.#sessionRepository.delete({ deviceId: deviceFingerprint });
    const user = await this.#userRepository.findOne({ phoneNumber });

    const isWorker = await this.#userRepository.hasWorkerProfile(user.id);
    const isClient = await this.#userRepository.hasClientProfile(user.id);
    const unHashedRefreshToken = generateToken({
      type: "refresh",
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isWorker,
      isClient,
      isActive: user.status == "ACTIVE"
    });

    logger.info("Generated Refresh Token:", expiresAt);

    const hashedToken = crypto.createHash("sha256").update(unHashedRefreshToken).digest("hex");

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
      await this.#sessionRepository.delete({
        userId,
        deviceId: deviceFingerprint,
      });
    } catch (err) {
      logger.error("Failed to revoke session:", err);
      throw err;
    }
  }
}
