/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 */

import { $Enums } from "@prisma/client";
import AppError from "../errors/AppError.js";
import Service from "./Service.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";
import UserRepository from "../repositories/database/UserRepository.js";
import GovernmentRepository from "../repositories/database/GovernmentRepository.js";

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */
/** @typedef {import("../types/asyncHandler.js").UserState} UserState */
/** @typedef {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} File */

/** @typedef {import("../repositories/database/UserRepository.js").OptionalUser} ReturnUserData */

/** @typedef {Partial<{role: $Enums.Role, firstName: string, middleName: string, lastName: string, governmentId: IDType, cityId: string, bio: string, profileImage: File, status: $Enums.AccountStatus}>} InputUserData */

/**
 * User Service - Manages user-related operations
 * @class
 * @extends Service
 */
export default class UserService extends Service {

  /** @type {UserRepository} */
  #userRepository;
  /** @type {GovernmentRepository} */
  #governmentRepository;

  /**
   * @param {Object} params
   * @param {UserRepository} params.userRepository
   * @param {GovernmentRepository} params.governmentRepository
   */
  constructor({ userRepository, governmentRepository }) {
    super();
    this.#userRepository = userRepository;
    this.#governmentRepository = governmentRepository;
  }

  /**
   * Get a user
   * @async
   * @method getUser
   * @param {Object} params
   * @param {IDType | undefined} params.userId - User ID
   * @param {IDType | undefined} params.phoneNumber - Phone number
   * @returns {Promise<ReturnUserData>} user
   */
  async get({ userId = undefined, phoneNumber = undefined }) {
    const user = await this.#userRepository.findFirst({ id: userId, phoneNumber: phoneNumber });
    return user;
  }

  /**
   * Update a user's basic information
   * @async
   * @method updateUser
   * @param {Object} params
   * @param {IDType} params.userId - User ID
   * @param {Partial<InputUserData>} params.data - Update data
   * @returns {Promise<import("../repositories/database/UserRepository.js").OptionalUser>} Updated user
   * @throws {AppError} If government or city not found
   */
  async update({ userId, data }) {
    const cities = await this.#governmentRepository.findCities({ id: data.cityId, governmentId: data.governmentId });
    if (!cities || cities.length === 0) throw new AppError("Government or city not found", 400);

    let url = undefined;
    if (data.profileImage) {
      url = (await uploadToCloudinary(data.profileImage.buffer, `${userId}/profile_image`, "profileMain")).url;
    }

    await this.#userRepository.update({
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      governmentId: data.governmentId,
      cityId: data.cityId,
      status: data.status,
      profileImageUrl: typeof url === "string" ? url : undefined
    }, { id: userId });
    return await this.#userRepository.findOne({ id: userId });
  }

  /**
   * Get all roles of a user
   * @async
   * @method getUserRoles
   * @param {Object} params
   * @param {IDType} params.userId - User ID
   * @returns {Promise<UserState>} Roles of user
   */
  async getStatus({ userId }) {

    const user = await this.#userRepository.findOne({ id: userId });
    const worker = await this.#userRepository.findWorkerProfile({ userId });
    let verification = null;
    if (worker) verification = await this.#userRepository.findWorkerProfileVerification({ workerProfileId: worker.id });
    const client = await this.#userRepository.findClientProfile({ userId });

    const userState = {
      role: user.role,
      userId: user.id,
      phoneNumber: user.phoneNumber,
      accountStatus: user.status,
      worker: worker ? { id: worker.id, verification: { status: verification.status, reason: verification.reason } } : undefined,
      client: client ? { id: client.id } : undefined,
    }

    return userState;
  }
}
