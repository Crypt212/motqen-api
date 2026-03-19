/**
 * @fileoverview Worker Service - Handle worker operations
 * @module services/WorkerService
 */

import AppError from '../errors/AppError.js';
import Service, { tryCatch } from './Service.js';
import * as pkg from '@prisma/client';
import { Repository } from '../repositories/database/Repository.js';
import WorkerRepository from '../repositories/database/WorkerRepository.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';

/**
 * @typedef {Object} InputWorkerData
 * @property {number} experienceYears
 * @property {boolean} isInTeam
 * @property {boolean} acceptsUrgentJobs
 * @property {import('../repositories/database/Repository.js').IDType[]} governmentIds
 * @property {{ mainId: import('../repositories/database/Repository.js').IDType, subIds: import('../repositories/database/Repository.js').IDType[] }[]} specializationsTree
 * @property {Buffer} [profileImageBuffer]
 * @property {Buffer} [idImageBuffer]
 * @property {Buffer} [profileWithIdImageBuffer]
 */

/**
 * @typedef {Object} InputWorkerUpdateData
 * @property {number} [experienceYears]
 * @property {boolean} [isInTeam]
 * @property {boolean} [acceptsUrgentJobs]
 */

/**
 * Worker Service - Manages worker-related operations
 * @class
 * @extends Service
 */
export default class WorkerService extends Service {
  /** @type {WorkerRepository} */
  #workerRepository;

  /**
   * @param {Object} params
   * @param {WorkerRepository} params.workerRepository
   */
  constructor({ workerRepository }) {
    super();
    this.#workerRepository = workerRepository;
  }

  /**
   * Create a worker profile for a user
   * @async
   * @method createWorkerProfile
   * @param {import('../repositories/database/Repository.js').IDType} userId
   * @param {InputWorkerData} data
   * @returns {Promise<{ workerProfile: import('@prisma/client').WorkerProfile }>}
   * @throws {AppError} If user not found or invalid data
   */
  async create(
    userId,
    {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      governmentIds,
      specializationsTree,
      profileImageBuffer,
      idImageBuffer,
      profileWithIdImageBuffer,
    }
  ) {
    return tryCatch(async () => {
      const nationalID = (
        await uploadToCloudinary(
          idImageBuffer,
          `${userId}/verification_info`,
          'nationalID'
        )
      ).url;
      const selfiWithID = (
        await uploadToCloudinary(
          profileWithIdImageBuffer,
          `${userId}/verification_info`,
          'selfiWithID'
        )
      ).url;

      let workerProfile;
      await Repository.createTransaction(
        [this.#workerRepository],
        async () => {
          workerProfile = await this.#workerRepository.create({
            data: {
              user: { connect: { id: userId } },
              experienceYears,
              isInTeam,
              acceptsUrgentJobs,
            },
          });

          await this.#workerRepository.insertWorkingGovernments({
            userId: workerProfile.userId,
            governmentIds,
          });
          await this.#workerRepository.insertSpecializations({
            workerProfileId: workerProfile.id,
            specializationsTree,
          });

          await this.#workerRepository.upsertVerification({
            workerProfileId: workerProfile.id,
            data: {
              workerProfile: { connect: { id: workerProfile.id } },
              idWithPersonalImageUrl: selfiWithID,
              idDocumentUrl: nationalID,
              status: 'PENDING',
              reason: 'Waiting for verification',
            },
          });

          if (profileImageBuffer) {
            const { url } = await uploadToCloudinary(
              profileImageBuffer,
              `${userId}/profile_image`,
              'profileMain'
            );
            await this.#workerRepository.update({
              id: workerProfile.id,
              data: { user: { update: { profileImageUrl: url } } },
            });
          }

          return workerProfile;
        },
        (reason) => {
          throw new AppError('Failed to create worker profile', 500, reason);
        }
      );

      return { workerProfile };
    });
  }

  /**
   * Update a worker's profile information
   * @async
   * @method updateWorkerProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.workerProfileId
   * @param {InputWorkerUpdateData} params.data
   * @returns {Promise<import('@prisma/client').WorkerProfile>}
   * @throws {AppError} If profile not found
   */
  async update({
    workerProfileId,
    data: { experienceYears, isInTeam, acceptsUrgentJobs },
  }) {
    return tryCatch(async () => {
      return await this.#workerRepository.update({
        id: workerProfileId,
        data: {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
        },
      });
    });
  }

  /**
   * Delete a worker's profile information
   * @async
   * @method deleteWorkerProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.workerProfileId
   * @returns {Promise<import('@prisma/client').WorkerProfile>}
   * @throws {AppError} If profile not found
   */
  async delete({ workerProfileId }) {
    return tryCatch(async () => {
      return await this.#workerRepository.delete({ id: workerProfileId });
    });
  }

  /**
   * Get working governments for worker
   * @async
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @param {import('../repositories/database/Repository.js').PaginationOptions} [params.pagination]
   * @param {pkg.Prisma.GovernmentFindManyArgs} [params.filter]
   * @returns {Promise<{ data: import('@prisma/client').Government[], pagination: import('../repositories/database/Repository.js').PaginatedResult }>}
   */
  async getWorkGovernments({
    userId,
    pagination = { page: 1, limit: 20 },
    filter = {},
  }) {
    return tryCatch(async () => {
      const result = await this.#workerRepository.findWorkingGovernments(
        /** @type {{userId: string, filter?: pkg.Prisma.GovernmentFindManyArgs, pagination?: import('../repositories/database/Repository.js').PaginationOptions}} */ ({
          userId,
          pagination,
        })
      );
      return result;
    });
  }

  /**
   * Add working governments for worker
   * @async
   * @method addWorkerProfileWorkGovernments
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.workerProfileId
   * @param {import('../repositories/database/Repository.js').IDType[]} params.governmentIds
   * @returns {Promise<{ count: number }>}
   */
  async addWorkGovernments({ workerProfileId, governmentIds }) {
    return tryCatch(async () => {
      const { count } =
        await this.#workerRepository.insertWorkingGovernments({
          userId: workerProfileId,
          governmentIds,
        });
      return { count };
    });
  }

  /**
   * Delete working governments for worker
   * @async
   * @method deleteWorkerProfileWorkGovernments
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.workerProfileId
   * @param {import('../repositories/database/Repository.js').IDType[]} [params.governmentIds]
   * @returns {Promise<{ count: number }>}
   */
  async deleteWorkGovernments({ workerProfileId, governmentIds = undefined }) {
    return tryCatch(async () => {
      const { count } =
        await this.#workerRepository.deleteWorkingGovernments({
          userId: workerProfileId,
          governmentIds,
        });
      return { count };
    });
  }

  /**
   * Get specialization tree for worker
   * @async
   * @method getWorkerProfileSpecializations
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @param {import('../repositories/database/Repository.js').IDType[]} [params.mainSpecializationIds]
   * @param {import('../repositories/database/Repository.js').PaginationOptions} [params.pagination]
   * @param {pkg.Prisma.ChosenSpecializationFindManyArgs} [params.filter]
   * @returns {Promise<{ data: { mainId: import('../repositories/database/Repository.js').IDType, subIds: import('../repositories/database/Repository.js').IDType[] }[], pagination: import('../repositories/database/Repository.js').PaginatedResult }>}
   */
  async getSpecializations({
    userId,
    mainSpecializationIds = undefined,
    pagination = { page: 1, limit: 20 },
    filter = {},
  }) {
    return tryCatch(async () => {
      const result =
        await this.#workerRepository.findSpecializations(
          /** @type {{userId: string, mainSpecializationIds?: string[], pagination?: import('../repositories/database/Repository.js').PaginationOptions, filter?: pkg.Prisma.ChosenSpecializationFindManyArgs}} */ ({
            userId,
            mainSpecializationIds,
            pagination,
            filter,
          })
        );
      return result;
    });
  }

  /**
   * Add specialization tree for worker
   * @async
   * @method addWorkerProfileSpecializations
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.workerProfileId
   * @param {{mainId: import('../repositories/database/Repository.js').IDType, subIds: import('../repositories/database/Repository.js').IDType[]}[]} params.specializationsTree
   */
  async addSpecializations({ workerProfileId, specializationsTree }) {
    return tryCatch(async () => {
      await this.#workerRepository.insertSpecializations({
        workerProfileId,
        specializationsTree,
      });
    });
  }

  /**
   * Delete main specializations
   * @async
   * @method deleteWorkerProfileMainSpecializations
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @param {import('../repositories/database/Repository.js').IDType[]} [params.mainSpecializationIds]
   * @returns {Promise<import('@prisma/client').Prisma.BatchPayload>}
   */
  async deleteSpecializations({
    userId,
    mainSpecializationIds = undefined,
  }) {
    return tryCatch(async () => {
      return await this.#workerRepository.deleteSpecializations({
        userId,
        specializationIds: mainSpecializationIds,
      });
    });
  }

  /**
   * Delete sub specializations
   * @async
   * @method deleteWorkerProfileSubSpecializations
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @param {{mainId: import('../repositories/database/Repository.js').IDType, subIds: import('../repositories/database/Repository.js').IDType[]}[]} params.specializationsTree
   * @returns {Promise<import('@prisma/client').Prisma.BatchPayload>}
   */
  async deleteSubSpecializations({ userId, specializationsTree }) {
    return tryCatch(async () => {
      for (const { mainId, subIds } of specializationsTree) {
        await this.#workerRepository.deleteSubSpecializations({
          userId,
          specializationId: mainId,
          subSpecializationIds: subIds,
        });
      }
    });
  }

  /**
   * Create or update worker profile verification
   * @async
   * @method createVerification
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.workerProfileId
   * @param {import('@prisma/client').Prisma.WorkerVerificationCreateInput} params.data
   * @returns {Promise<import('@prisma/client').WorkerVerification>}
   */
  async createVerification({ workerProfileId, data }) {
    return tryCatch(async () => {
      return await this.#workerRepository.upsertVerification({
        workerProfileId,
        data,
      });
    });
  }

  /**
   * Get a worker profile's verification
   * @async
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.workerProfileId
   * @returns {Promise<import('@prisma/client').WorkerVerification | null>}
   */
  async getVerification({ workerProfileId }) {
    return tryCatch(async () => {
      return await this.#workerRepository.findVerification({
        workerProfileId,
      });
    });
  }

  /**
   * Get a worker's profile for a user
   * @async
   * @method getWorkerProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @returns {Promise<import('@prisma/client').WorkerProfile | null>}
   */
  async get({ userId }) {
    return tryCatch(async () => {
      return await this.#workerRepository.findByUserId({ userId });
    });
  }

  /**
   * Check if user has a worker profile
   * @async
   * @method hasWorkerProfile
   * @param {Object} params
   * @param {import('../repositories/database/Repository.js').IDType} params.userId
   * @returns {Promise<boolean>}
   */
  async hasWorkerProfile({ userId }) {
    return await this.#workerRepository.exists({ userId });
  }
}
