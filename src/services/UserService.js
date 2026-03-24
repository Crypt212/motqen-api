/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 */

import * as pkg from '@prisma/client';
import Service from './Service.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import UserRepository from '../repositories/database/UserRepository.js';
import ClientRepository from '../repositories/database/ClientRepository.js';
import WorkerRepository from '../repositories/database/WorkerRepository.js';
import { handleOrder } from '../utils/handleFilteration.js';

/**
 * @typedef {Object} InputUserData
 * @property {pkg.$Enums.Role} [role]
 * @property {string} [firstName]
 * @property {string} [middleName]
 * @property {string} [lastName]
 * @property {string} [bio]
 * @property {Buffer} [profileImageBuffer]
 * @property {pkg.$Enums.AccountStatus} [status]
 */

/**
 * @typedef {Object} UserState
 * @property {pkg.$Enums.Role} role
 * @property {string} userId
 * @property {string} phoneNumber
 * @property {pkg.$Enums.AccountStatus} accountStatus
 * @property {{ id: string, verification: { status: pkg.$Enums.VerificationStatus, reason?: string } } | undefined} worker
 * @property {{ id: string } | undefined} client
 */

/**
 * User Service - Manages user-related operations
 * @class
 * @extends Service
 */
export default class UserService extends Service {
  /** @type {UserRepository} */
  #userRepository;
  /** @type {WorkerRepository} */
  #workerRepository;
  /** @type {ClientRepository} */
  #clientRepository;

  /**
   * @param {Object} params
   * @param {UserRepository} params.userRepository
   * @param {WorkerRepository} params.workerRepository
   * @param {ClientRepository} params.clientRepository
   */
  constructor({ userRepository, workerRepository, clientRepository }) {
    super();
    this.#userRepository = userRepository;
    this.#workerRepository = workerRepository;
    this.#clientRepository = clientRepository;
  }

  /**
   * Get a user by ID or phone number
   * @async
   * @method getUser
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} [params.userId]
   * @param {string} [params.phoneNumber]
   * @returns {Promise<pkg.User | null>}
   */
  async get({ userId = undefined, phoneNumber = undefined }) {
    const user = await this.#userRepository.findFirst({
      id: userId,
      phoneNumber: phoneNumber,
    });
    return user;
  }

  /**
   * Find many users with pagination, filtering, and ordering
   * @async
   * @method findMany
   * @param {Object} params
   * @param {pkg.Prisma.UserFindManyArgs} [params.filter={}]
   * @param {import('../repositories/database/Repository.js').PaginationOptions} [params.pagination]
   * @param {import('../repositories/database/Repository.js').OrderingOptions[]} [params.orderBy=[]]
   * @returns {Promise<{data: pkg.User[], pagination: import('../repositories/database/Repository.js').PaginatedResult}>}
   */
  async findMany({
    filter = {},
    pagination = { page: 1, limit: 20 },
    orderBy = [],
  }) {
    filter.orderBy = /** @type {import('@prisma/client').Prisma.UserOrderByWithRelationInput[]} */ (handleOrder({ sortBy: orderBy[0]?.sortBy, sortOrder: orderBy[0]?.sortOrder }));

    return /** @type {any} */ (await this.#userRepository.findMany({
      filter: /** @type {pkg.Prisma.UserFindManyArgs} */ ({ ...filter, pagination }),
    }));
  }

  /**
   * Update a user's basic information
   * @async
   * @method updateUser
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @param {Partial<InputUserData>} params.data
   * @returns {Promise<pkg.User>}
   */
  async update({ userId, data }) {
    let url = undefined;
    if (data.profileImageBuffer) {
      url = (
        await uploadToCloudinary(
          data.profileImageBuffer,
          `${userId}/profile_image`,
          'profileMain'
        )
      ).url;
    }

    await this.#userRepository.updateMany({
      data: {
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status,
        profileImageUrl: typeof url === 'string' ? url : undefined,
      },
      where: { id: userId },
    });
    return await this.#userRepository.findFirst({ id: userId });
  }

  /**
   * Get all roles of a user
   * @async
   * @method getUserRoles
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @returns {Promise<UserState>}
   */
  async getStatus({ userId }) {
    const user = await this.#userRepository.findFirst({ id: userId });
    const worker = await this.#workerRepository.findFirst({ userId });
    let verification = null;
    if (worker)
      verification = await this.#workerRepository.findVerification(
        { workerProfileId: worker.id }
      );
    const client = await this.#clientRepository.findFirst({ userId });

    const userState = {
      role: user.role,
      userId: user.id,
      phoneNumber: user.phoneNumber,
      accountStatus: user.status,
      worker: worker
        ? {
            id: worker.id,
            verification: {
              status: verification?.status,
              reason: verification?.reason,
            },
          }
        : undefined,
      client: client ? { id: client.id } : undefined,
    };

    return userState;
  }

  /**
   * Check if user exists
   * @async
   * @method exists
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} [params.userId]
   * @param {string} [params.phoneNumber]
   * @returns {Promise<boolean>}
   */
  async exists({ userId, phoneNumber }) {
    return await this.#userRepository.exists({ id: userId, phoneNumber });
  }
}
