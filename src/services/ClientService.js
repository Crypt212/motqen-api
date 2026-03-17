/**
 * @fileoverview Client Service - Handle client operations
 * @module services/ClientService
 */

import AppError from '../errors/AppError.js';
import Service, { tryCatch } from './Service.js';
import UserRepository from '../repositories/database/UserRepository.js';
import { Repository } from '../repositories/database/Repository.js';
import ClientRepository from '../repositories/database/ClientRepository.js';

/**
 * @typedef {Object} InputClientData
 * @property {string} address
 * @property {string} [addressNotes]
 * @property {import('../repositories/database/Repository.js').IDType} governmentId
 * @property {import('../repositories/database/Repository.js').IDType} cityId
 */

/**
 * @typedef {Object} InputClientUpdateData
 * @property {string} [address]
 * @property {string} [addressNotes]
 */

/**
 * Client Service - Manages client-related operations
 * @class
 * @extends Service
 */
export default class ClientService extends Service {
  /** @type {ClientRepository} */
  #clientRepository;
  /** @type {UserRepository} */
  #userRepository;

  /**
   * @param {Object} params
   * @param {ClientRepository} params.clientRepository
   * @param {UserRepository} params.userRepository
   */
  constructor({ clientRepository, userRepository }) {
    super();
    this.#clientRepository = clientRepository;
    this.#userRepository = userRepository;
  }

  /**
   * Get a client's profile for a user
   * @async
   * @method getClientProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @returns {Promise<import('@prisma/client').ClientProfile>}
   * @throws {AppError} If user or profile not found
   */
  async get({ userId }) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findFirst({ id: userId });
      if (!user) throw new AppError('User not found', 404);

      const clientProfile = await this.#clientRepository.findByUserId({
        userId,
      });
      if (!clientProfile) throw new AppError('Client profile not found', 404);

      return clientProfile;
    });
  }

  /**
   * Create a client profile for a user
   * @async
   * @method createClientProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @param {InputClientData} params.data
   * @returns {Promise<import('@prisma/client').ClientProfile>}
   * @throws {AppError} If user not found
   */
  async create({ userId, data }) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findFirst({ id: userId });
      if (!user) throw new AppError('User not found', 404);

      return await Repository.createTransaction(
        [this.#clientRepository],
        async () => {
          const clientProfile = await this.#clientRepository.createByUserId({
            userId,
            data: {
              locations: {
                create: {
                  governmentId: data.governmentId,
                  cityId: data.cityId,
                  address: data.address,
                  addressNotes: data.addressNotes,
                  isMain: true,
                },
              },
            },
          });

          return clientProfile;
        },
        (reason) => {
          throw new AppError('Failed to create client profile', 500, reason);
        }
      );
    });
  }

  /**
   * Update a client's profile for a user
   * @async
   * @method updateClientProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.clientProfileId
   * @param {InputClientUpdateData} params.data
   * @returns {Promise<import('@prisma/client').ClientProfile>}
   * @throws {AppError} If profile not found
   */
  async update({ clientProfileId, data }) {
    return tryCatch(async () => {
      return await this.#clientRepository.update({ id: clientProfileId, data });
    });
  }

  /**
   * Delete a client's profile information
   * @async
   * @method deleteClientProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.clientProfileId
   * @returns {Promise<import('@prisma/client').ClientProfile>}
   * @throws {AppError} If profile not found
   */
  async delete({ clientProfileId }) {
    return tryCatch(async () => {
      return await this.#clientRepository.delete({ id: clientProfileId });
    });
  }

  /**
   * Check if user has a client profile
   * @async
   * @method hasClientProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @returns {Promise<boolean>}
   */
  async hasClientProfile({ userId }) {
    return await this.#clientRepository.exists({ userId });
  }
}
