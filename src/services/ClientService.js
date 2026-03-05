/**
 * @fileoverview Client Service - Handle client operations
 * @module services/ClientService
 */

import AppError from "../errors/AppError.js";
import Service, { tryCatch } from "./Service.js";
import UserRepository from "../repositories/database/UserRepository.js";
import { Repository } from "../repositories/database/Repository.js";

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */
/** @typedef {import("../repositories/database/UserRepository.js").ClientProfile} ReturnClientProfile */
/** @typedef {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} File */
/** @typedef {{address: String, addressNotes: String}} InputClientProfileData */

/**
 * Client Service - Manages client-related operations
 * @class
 * @extends Service
 */
export default class ClientService extends Service {

  /** @type {UserRepository} */
  #userRepository;

  /**
   * @param {Object} params
   * @param {UserRepository} params.userRepository
   */
  constructor({ userRepository }) {
    super();
    this.#userRepository = userRepository;
  }

  /**
   * Get a client's profile for a user
   * @async
   * @method getClientProfile
   * @param {Object} params
   * @param {IDType} params.userId - User ID
   * @returns {Promise<ReturnClientProfile>} Client profile
   * @throws {AppError} If user not found
   */
  async get({ userId }) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findFirst({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const clientProfile = await this.#userRepository.findClientProfile({ userId });
      if (!clientProfile)
        throw new AppError("Client profile not found", 404);

      return clientProfile;
    });
  }

  /**
   * Create a client profile for a user
   * @async
   * @method createClientProfile
   * @param {Object} params
   * @param {IDType} params.userId - User ID
   * @param {InputClientProfileData} params.data
   * @returns {Promise<ReturnClientProfile>} Created client profile
   * @throws {AppError} If user not found
   */
  async create({
    userId,
    data,
  }) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findFirst({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      return await Repository.createTransaction([this.#userRepository], async () => {

        const clientProfile = await this.#userRepository.createClientProfile({ userId: user.id, data: { address: data.address, addressNotes: data.addressNotes } });

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
   * @param {Object} params
   * @param {IDType} params.clientProfileId - Client Profile ID
   * @param {Partial<InputClientProfileData>} params.data - Client profile data to update
   * @returns {Promise<ReturnClientProfile>} Updated client profile
   * @throws {AppError} If user not found or profile not found
   */
  async update({ clientProfileId, data }) {
    return tryCatch(async () => {
      return await this.#userRepository.updateClientProfile({ clientProfileId, data });
    });
  }

  /**
   * Delete a client's profile information
   * @async
   * @method deleteClientProfile
   * @param {Object} params
   * @param {IDType} params.clientProfileId - Client Profile ID
   * @returns {Promise<ReturnClientProfile>} Deleted client profile
   * @throws {AppError} If user not found
   */
  async delete({ clientProfileId }) {
    return tryCatch(async () => {
      return await this.#userRepository.deleteClientProfile({ clientProfileId });
    });
  }
}
