/**
 * @fileoverview Client Service - Handle client operations
 * @module services/ClientService
 */

import AppError from "../errors/AppError.js";
import Service, { tryCatch } from "./Service.js";
import UserRepository from "../repositories/database/UserRepository.js";
import { Repository } from "../repositories/database/Repository.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */

/**
 * Client Service - Manages client-related operations
 * @class
 * @extends Service
 */
export default class ClientService extends Service {

  /** @type {UserRepository} */
  #userRepository;

  /**
   * @param {UserRepository} userRepository
   */
  constructor(userRepository) {
    super();
    this.#userRepository = userRepository;
  }

  /**
   * Get a client's profile for a user
   * @async
   * @method getClientProfile
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @returns {Promise<import("../repositories/database/UserRepository.js").ClientProfile>} Client profile
   * @throws {AppError} If user not found
   */
  async getClientProfile(userId) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const clientProfile = await this.#userRepository.getClientProfile(userId);
      if (!clientProfile)
        throw new AppError("Client profile not found", 404);

      return clientProfile;
    });
  }

  /**
   * Create a client profile for a user
   * @async
   * @method createClientProfile
   * @param {Object} params - Client profile parameters
   * @param {import("../repositories/database/Repository.js").IDType} params.userId - User ID
   * @param {String} params.address - Address of the client
   * @param {String} params.addressNotes - Additional address information
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile | null} params.profileImage - Profile image URL
   * @returns {Promise<import("../repositories/database/UserRepository.js").ClientProfile>} Created client profile
   * @throws {AppError} If user not found
   */
  async createClientProfile({
    userId,
    address,
    addressNotes,
    profileImage = null,
  }) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      return await Repository.createTransaction([this.#userRepository], async () => {

        const clientProfile = await this.#userRepository.createClientProfile(user.id, { address, addressNotes });
        await this.#userRepository.update({ profileImageUrl: (await uploadToCloudinary(profileImage, `${user.phoneNumber}/profile_image`, "profileMain")).url }, { id: userId });

        if (profileImage) {
          // it will be user uuid instead of phoneNumber
          const { url } = await uploadToCloudinary(profileImage, `${user.phoneNumber}/profile_image`, "profileMain");
          profileImage = url
        }


        return clientProfile;
      }, (reason) => {
        throw new AppError("Failed to create worker profile", 500, reason);
      });
    });
  }

  /**
   * Update a client's profile for a user
   * @async
   * @method updateClientProfile
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @param {Object} data - Client profile data to update
   * @returns {Promise<import("../repositories/database/UserRepository.js").ClientProfile>} Updated client profile
   * @throws {AppError} If user not found or profile not found
   */
  async updateClientProfile(userId, data = {}) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const clientProfile = await this.#userRepository.getClientProfile(userId);
      if (!clientProfile)
        throw new AppError("Client profile not found", 404);

      return await this.#userRepository.updateClientProfile(userId, data);
    });
  }
}
