/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 */

import { $Enums } from "@prisma/client";
import AppError from "../errors/AppError.js";
import Service, { tryCatch } from "./Service.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";
import UserRepository from "../repositories/database/UserRepository.js";
import GovernmentRepository from "../repositories/database/GovernmentRepository.js";

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */

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
   * @param {UserRepository} userRepository
   * @param {GovernmentRepository} governmentRepository
   */
  constructor(userRepository, governmentRepository) {
    super();
    this.#userRepository = userRepository;
    this.#governmentRepository = governmentRepository;
  }

  /**
   * Get a user
   * @async
   * @method getUser
   * @param {import("../repositories/database/UserRepository.js").IDType} userId - User ID
   * @returns {Promise<import("../repositories/database/UserRepository.js").OptionalUser>} user
   */
  async getUser(userId) {
    const user = await this.#userRepository.findOne({ id: userId });
    return user;
  }

  /**
   * Get all roles of a user
   * @async
   * @method getUserRoles
   * @param {import("../repositories/database/UserRepository.js").IDType} userId - User ID
   * @returns {Promise<{ isWorker: boolean, isClient: boolean }>} Roles of user
   */
  async getUserRoles(userId) {
    const isWorker = await this.#userRepository.hasWorkerProfile(userId);
    const isClient = await this.#userRepository.hasClientProfile(userId);
    return { isWorker, isClient };
  }

  /**
   * Update a user's basic information
   * @async
   * @method updateUser
   * @param {import("../repositories/database/UserRepository.js").IDType} userId - User ID
   * @param {Object} data - Update data
   * @param {$Enums.Role} [data.role] - User's role
   * @param {string} [data.firstName] - First name
   * @param {string} [data.lastName] - Last name
   * @param {string} [data.governmentId] - Government ID
   * @param {string} [data.city] - City name
   * @param {string} [data.bio] - Biography
   * @param {$Enums.AccountStatus} [data.status] - Account status
   * @returns {Promise<import("../repositories/database/UserRepository.js").OptionalUser>} Updated user
   * @throws {AppError} If government or city not found
   */
  async updateUser(userId, data) {
    const government = await this.#governmentRepository.findOne({ name: data.governmentId });
    if (!government) throw new AppError("Government not found", 400);

    // let cityId = undefined;
    // const cities = await this.#governmentRepository.findCities({ governmentId, name: data.city });
    // if (!cities || cities.length === 0)
    //   throw new AppError("City not found", 400);
    // cityId = cities[0].id;

    await this.#userRepository.update({
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      governmentId: data.governmentId,
      cityName: data.city,
      status: data.status
    }, { id: userId });
    return await this.#userRepository.findOne({ id: userId });
  }


  /**
   * Get user's profile image URL
   * @async
   * @method getProfileImage
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @returns {Promise<string|null>} Profile image URL or null
   * @throws {AppError} If user not found
   */
  async getProfileImage(userId) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      return user.profileImageUrl;
    });
  }

  /**
   * Update user's profile image URL
   * For workers, the image will not be updated until approved by an admin
   * @async
   * @method updateProfileImage
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @param {Buffer} profileImageBuffer - New profile image URL
   * @returns {Promise<import("../repositories/database/UserRepository.js").User>} Updated user
   * @throws {AppError} If user not found
   */
  async updateProfileImage(userId, profileImageBuffer) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      //-----------------------------> suspended to v2 <----------------------------
      //for client it is free to change anytime
      //for worker it will be an requset
      //  1- upload
      //  2 - create request
      //  3- pending untill approve from admin
      //maybe add an profile photo history to select from his old photos
      //-----------------------------------------------------------------------------

      const { url } = await uploadToCloudinary(profileImageBuffer, `${userId}/profileImage`, "profileImage");
      await this.#userRepository.update({ profileImageUrl: url }, { id: userId });
      return this.#userRepository.findOne({ id: userId });
    });
  }

  /**
   * Delete user's profile image URL
   * Workers cannot delete their profile image
   * @async
   * @method deleteProfileImage
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @returns {Promise<import("../repositories/database/UserRepository.js").User>} Updated user with null profileImage
   * @throws {AppError} If user not found or is a worker
   */
  async deleteProfileImage(userId) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      // Check if user has a worker profile - workers cannot delete their profile image
      const isWorker = await this.#userRepository.hasWorkerProfile(userId);
      if (isWorker) {
        throw new AppError("Workers cannot delete their profile image.", 403);
      }
      await this.#userRepository.update({ profileImageUrl: null, }, { id: userId });
      return this.#userRepository.findOne({ id: userId });
    });
  }
}
