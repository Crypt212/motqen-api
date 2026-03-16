/**
 * @fileoverview Worker Service - Handle worker operations
 * @module services/WorkerService
 */

import AppError from "../errors/AppError.js";
import Service, { tryCatch } from "./Service.js";
import { Repository } from "../repositories/database/Repository.js";
import UserRepository from "../repositories/database/UserRepository.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";

/** @template T @typedef {import("../repositories/database/Repository.js").PaginatedResult<T>} PaginatedResult */

/** @typedef {import("../repositories/database/GovernmentRepository.js").Government} Government */

/** @typedef {import("../repositories/database/UserRepository.js").SpecializationTree} SpecializationTree */
/** @typedef {import("../repositories/database/UserRepository.js").WorkerVerificationData} WorkerVerificationData */
/** @typedef {import("../repositories/database/UserRepository.js").WorkerVerificationFilter} WorkerVerificationFilter */
/** @typedef {import("../repositories/database/UserRepository.js").WorkerVerification} WorkerVerification */

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */
/** @typedef {import("../repositories/database/UserRepository.js").WorkerProfile} WorkerProfile */
/** @typedef {import("../repositories/database/UserRepository.js").WorkerProfileFilter} WorkerProfileFilter */
/** @typedef {import("../repositories/database/UserRepository.js").PaginationOptions} PaginationOptions */
/** @typedef {import("../repositories/database/UserRepository.js").OrderingOptions} OrderingOptions */

/**
 * Worker Service - Manages worker-related operations
 * @class
 * @extends Service
 */
export default class WorkerService extends Service {

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
   * Create a worker profile for a user
   * @async
   * @method createWorkerProfile
   * @param {IDType} userId - User ID
   * @param {Object} data - Worker profile data
   * @param {number} data.experienceYears - Years of experience
   * @param {boolean} data.isInTeam - Whether worker is in a team
   * @param {boolean} data.acceptsUrgentJobs - Whether worker accepts urgent jobs
   * @param {{ mainId: string, subIds: string[] }[]} data.specializationsTree - Tree of main specialization and sub specializations
   * @param {IDType[]} data.governmentIds - List of government names where worker operates
   * @param {Buffer} data.profileImageBuffer - Profile image URL
   * @param {Buffer} data.idImageBuffer - ID image URL
   * @param {Buffer} data.profileWithIdImageBuffer - Profile with ID image URL
   * @returns {Promise<WorkerProfile>} Created worker profile
   * @throws {AppError} If user not found or invalid data
   */
  async create(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    governmentIds,
    specializationsTree,
    profileImageBuffer,
    idImageBuffer,
    profileWithIdImageBuffer
  }) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findFirst({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      /** @type {WorkerProfile} */
      let workerProfile;

      await Repository.createTransaction([this.#userRepository], async () => {
        workerProfile = await this.#userRepository.insertWorkerProfile({
          userId,
          data: {
            experienceYears,
            isInTeam,
            acceptsUrgentJobs,
          },
          verificationData: undefined
        });

        await this.#userRepository.insertWorkerProfileGovernments({ workerProfileId: workerProfile.id, governmentIds });
        await this.#userRepository.insertWorkerProfileSpecializations({ workerProfileId: workerProfile.id, specializationsTree });

        const nationalID = (await uploadToCloudinary(idImageBuffer, `${userId}/verification_info`, "nationalID")).url
        const selfiWithID = (await uploadToCloudinary(profileWithIdImageBuffer, `${userId}/verification_info`, "selfiWithID")).url

        await this.#userRepository.upsertWorkerProfileVerification({
          workerProfileId: workerProfile.id,
          verificationData: {
            idWithPersonalImageUrl: selfiWithID,
            idDocumentUrl: nationalID,
            status: "PENDING",
            reason: "Waiting for verification"

          }
        })

        await this.#userRepository.updateMany({ profileImageUrl: (await uploadToCloudinary(profileImageBuffer, `${user.phoneNumber}/profile_image`, "profileMain")).url }, { id: user.id });

        return workerProfile;
      }, (reason) => {
        throw new AppError("Failed to create worker profile", 500, reason);
      });

      return { workerProfile };
    });
  }

  /**
   * Update a worker's profile information
   * @async
   * @method updateWorkerProfile
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {Object} [params.data] - Worker profile data to update
   * @param {number} [params.data.experienceYears] - Years of experience
   * @param {boolean} [params.data.isInTeam] - Whether worker is in a team
   * @param {boolean} [params.data.acceptsUrgentJobs] - Whether worker accepts urgent jobs
   * @returns {Promise<WorkerProfile>} Updated worker profile
   * @throws {AppError} If user not found
   */
  async update({
    workerProfileId,
    data: {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
    }
  }) {
    return tryCatch(async () => {
      return await this.#userRepository.updateWorkerProfile({
        workerProfileId,
        data: {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
        },
        verificationData: undefined

      });
    });
  }

  /**
   * Delete a worker's profile information
   * @async
   * @method deleteWorkerProfile
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @returns {Promise<WorkerProfile>} Deleted worker profile
   * @throws {AppError} If user not found
   */
  async delete({ workerProfileId }) {
    return tryCatch(async () => {
      return await this.#userRepository.deleteWorkerProfile({ workerProfileId });
    });
  }

  /**
   * Get working governments for worker
   * @async
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {Object} [params.pagination] - Pagination options { page, limit }
   * @param {Object} [params.filter] - Filter options
   * @param {Object[]} [params.orderBy] - OrderBy options [{ field, direction }]
   * @param {boolean} [params.paginate] - Whether to return paginated results
   * @returns {Promise<PaginatedResult<Government>>}
   */
  async getWorkGovernments({ workerProfileId, pagination = { page: 1, limit: 20 }, filter = {}, orderBy = [], paginate = false }) {
    return tryCatch(async () => {
      const result = await this.#userRepository.findWorkerProfileGovernments({
        workerProfileId,
        pagination,
        filter,
        orderBy,
        paginate
      });
      return result;
    });
  }

  /**
   * Add working governments for worker
   * @async
   * @method addWorkerProfileWorkGovernments
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {IDType[]} params.governmentIds - Ids of working governments
   * @returns {Promise<Number>} Number of added governments
   */
  async addWorkGovernments({ workerProfileId, governmentIds }) {
    return tryCatch(async () => {
      Repository.createTransaction([this.#userRepository], async () => {
        const { count } = await this.#userRepository.insertWorkerProfileGovernments({ workerProfileId, governmentIds });
        return count;
      }, (error) => {
        throw new AppError("Failed to insert worker profile governments", 400, error);
      });
    });
  }

  /**
   * Delete working governments for worker
   * @async
   * @method deleteWorkerProfileWorkGovernments
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {IDType[] | undefined} params.governmentIds - Ids of working governments
   * @returns {Promise<Number>} Number of deleted governments
   */
  async deleteWorkGovernments({ workerProfileId, governmentIds = undefined }) {
    return tryCatch(async () => {
      Repository.createTransaction([this.#userRepository], async () => {
        const { count } = await this.#userRepository.deleteWorkerProfileGovernments({ workerProfileId, governmentIds });
        return count;
      }, (error) => {
        throw new AppError("Failed to insert worker profile governments", 400, error);
      });
    });
  }

  /**
   * Get specialization tree for worker
   * @async
   * @method getWorkerProfileSpecializations
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {IDType[] | undefined} params.mainSpecializationIds - IDs of the main specializations to get retrieved
   * @param {Object} [params.pagination] - Pagination options { page, limit }
   * @param {Object} [params.filter] - Filter options
   * @param {Object[]} [params.orderBy] - OrderBy options [{ field, direction }]
   * @param {boolean} [params.paginate] - Whether to return paginated results
   * @returns {Promise<PaginatedResult<SpecializationTree>>}
   */
  async getSpecializations({ workerProfileId, mainSpecializationIds = undefined, pagination = { page: 1, limit: 20 }, filter = {}, orderBy = [], paginate = false }) {
    return tryCatch(async () => {
      const result = await this.#userRepository.findWorkerProfileSpecializations({
        workerProfileId,
        mainSpecializationIds,
        pagination,
        filter,
        orderBy,
        paginate
      });
      return result;
    });
  }

  /**
   * Add specialization tree for worker
   * @async
   * @method addWorkerProfileSpecializations
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {{mainId: IDType, subIds: IDType[]}[]} params.specializationsTree - Tree of main and sub specializations
   */
  async addSpecializations({ workerProfileId, specializationsTree }) {
    return tryCatch(async () => {
      Repository.createTransaction([this.#userRepository], async () => {
        await this.#userRepository.insertWorkerProfileSpecializations({ workerProfileId, specializationsTree });
      }, (error) => {
        throw new AppError("Failed to insert worker profile specializations", 400, error);
      });
    });
  }

  /**
   * Delete main specializations
   * @async
   * @method deleteWorkerProfileMainSpecializations
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {IDType[] | undefined} params.mainSpecializationIds - IDs of main specializations to be deleted
   * @returns {Promise<Number>} Number of deleted main specializations
   */
  async deleteSpecializations({ workerProfileId, mainSpecializationIds = undefined }) {
    return tryCatch(async () => {
      const { count } = await this.#userRepository.deleteWorkerProfileSpecializations({ workerProfileId, specializationIds: mainSpecializationIds });
      return count;
    });
  }

  /**
   * Delete sub specializations
   * @async
   * @method deleteWorkerProfileSubSpecializations
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @param {{mainId: IDType, subIds: IDType[]}[]} params.specializationsTree - Tree of main and sub specializations
   * @returns {Promise<Number>} Number of deleted sub specializations
   */
  async deleteSubSpecializations({ workerProfileId, specializationsTree }) {
    return tryCatch(async () => {
      Repository.createTransaction([this.#userRepository], async () => {
        for (const { mainId, subIds } of specializationsTree) {
          await this.#userRepository.deleteWorkerProfileSubSpecializations({ workerProfileId, specializationId: mainId, subSpecializationIds: subIds });
        }
      }, (error) => {
        throw new AppError("Failed to delete worker profile sub specializations", 400, error);
      });
    });
  }

  /**
   * @async
   * @method
   * @param {Object} params
   * @param {IDType} params.workerProfileId
   * @param {WorkerVerificationData} params.data
   * @returns {Promise<WorkerVerificationFilter>}
   */
  async createVerification({ workerProfileId, data }) {
    return tryCatch(async () => {
      const verification = await this.#userRepository.upsertWorkerProfileVerification({ workerProfileId, verificationData: data });
      return verification;
    });
  }

  /**
   * Get a worker profile's verification
   * @async
   * @param {Object} params
   * @param {IDType} params.workerProfileId - Worker Profile ID
   * @returns {Promise<WorkerVerification>}
   * @throws {AppError} If user not found
   */
  async getVerification({ workerProfileId }) {
    return tryCatch(async () => {
      const verification = await this.#userRepository.findWorkerProfileVerification({ workerProfileId });

      return verification;
    });
  }

  /**
   * Get a worker's profile for a user
   * @async
   * @method getWorkerProfile
   * @param {Object} params
   * @param {IDType} params.userId - User ID
   * @returns {Promise<WorkerProfile>} Worker profile
   * @throws {AppError} If user not found
   */
  async get({ userId }) {
    return tryCatch(async () => {
      const workerProfile = await this.#userRepository.findWorkerProfile({ userId });
   //   if (!workerProfile)
//        throw new AppError("Worker profile not found", 404);

      return workerProfile;
    });
  }

  /**
   * Check if user has a worker profile
   * @async
   * @method hasWorkerProfile
   * @param {Object} params
   * @param {IDType} params.userId - User ID
   * @returns {Promise<boolean>}
   */
  async hasWorkerProfile({ userId }) {
    return await this.#userRepository.hasWorkerProfile({ userId });
  }
}
