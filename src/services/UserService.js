/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 */

import pkg from "@prisma/client";
const { $Enums } = pkg;
import AppError from "../errors/AppError.js";
import Service from "./Service.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";
import UserRepository from "../repositories/database/UserRepository.js";
import GovernmentRepository from "../repositories/database/GovernmentRepository.js";

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */
/** @typedef {import("../types/asyncHandler.js").UserState} UserState */
/** @typedef {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} File */
/** @typedef {import("../repositories/database/UserRepository.js").OptionalUser} ReturnUserData */
/** @typedef {import("../repositories/database/UserRepository.js").UserFilter} UserFilter */
/** @typedef {import("../repositories/database/UserRepository.js").PaginationOptions} PaginationOptions */
/** @typedef {import("../repositories/database/UserRepository.js").OrderingOptions} OrderingOptions */

/** @typedef {Partial<{role: $Enums.Role, firstName: string, middleName: string, lastName: string, governmentId: IDType, cityId: string, bio: string, profileImageBuffer: Buffer, status: $Enums.AccountStatus}>} InputUserData */

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
   * Get a user by ID or phone number
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
   * Find many users with pagination, filtering, and ordering
   * Uses the flexible findMany method
   * @async
   * @method findMany
   * @param {Object} params
   * @param {UserFilter} [params.filter={}] - Filter criteria
   * @param {PaginationOptions} [params.pagination] - Pagination options
   * @param {OrderingOptions[]} [params.orderBy=[]] - Ordering options
   * @param {boolean} [params.paginate=false] - Whether to return paginated results
   * @returns {Promise<import("../repositories/database/Repository.js").PaginatedResult<ReturnUserData>>} | ReturnUserData[]>}
   */
  async findMany({
    filter = {},
    pagination = { page: 1, limit: 20 },
    orderBy = [],
    paginate = false
  }) {
    return await this.#userRepository.findMany({
      where: filter,
      pagination,
      orderBy,
      paginate
    });
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
    const cities = await this.#governmentRepository.findCities({
      filter: {
        id: data.cityId,
        governmentId: data.governmentId
      }
    });
    if (!cities || cities.data.length === 0) throw new AppError("Government or city not found", 400);

    let url = undefined;
    if (data.profileImageBuffer) {
      url = (await uploadToCloudinary(data.profileImageBuffer, `${userId}/profile_image`, "profileMain")).url;
    }

    await this.#userRepository.updateMany({
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      governmentId: data.governmentId,
      cityId: data.cityId,
      status: data.status,
      profileImageUrl: typeof url === "string" ? url : undefined
    }, { id: userId });
    return await this.#userRepository.findFirst({ id: userId });
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

    const user = await this.#userRepository.findFirst({ id: userId });
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

  /**
   * Check if user exists
   * @async
   * @method exists
   * @param {Object} params
   * @param {IDType} [params.userId] - User ID
   * @param {string} [params.phoneNumber] - Phone number
   * @returns {Promise<boolean>}
   */
  async exists({ userId, phoneNumber }) {
    return await this.#userRepository.exists({ id: userId, phoneNumber });
  }
}
