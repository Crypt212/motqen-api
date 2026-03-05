/**
 * @fileoverview Worker Service - Handle worker operations
 * @module services/WorkerService
 */

import AppError from "../errors/AppError.js";
import Service, { tryCatch } from "./Service.js";
import { Repository } from "../repositories/database/Repository.js";
import UserRepository from "../repositories/database/UserRepository.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";

/** @typedef {import("../repositories/database/UserRepository.js").WorkerProfile} WorkerProfile */
/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */
/** @typedef {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} File */

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
   * @param {File} data.profileImage - Profile image URL
   * @param {File} data.idImage - ID image URL
   * @param {File} data.profileWithIdImage - Profile with ID image URL
   * @returns {Promise<WorkerProfile>} Created worker profile
   * @throws {AppError} If user not found or invalid data
   */
  async create(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    governmentIds,
    specializationsTree,
    profileImage,
    idImage,
    profileWithIdImage
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

        const nationalID = (await uploadToCloudinary(idImage.buffer, `${userId}/verification_info`, "nationalID")).url
        const selfiWithID = (await uploadToCloudinary(profileWithIdImage.buffer, `${userId}/verification_info`, "selfiWithID")).url

        await this.#userRepository.upsertWorkerProfileVerification({
          workerProfileId: workerProfile.id,
          verificationData: {
            idWithPersonalImageUrl: selfiWithID,
            idDocumentUrl: nationalID,
            status: "PENDING",
            reason: "Waiting for verification"

          }
        })

        await this.#userRepository.update({ profileImageUrl: (await uploadToCloudinary(profileImage.buffer, `${user.phoneNumber}/profile_image`, "profileMain")).url }, { id: user.id });

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
   * @returns {Promise<Number>} Number of got governments
   */
  async getWorkGovernments({ workerProfileId }) {
    return tryCatch(async () => {
      const governments = await this.#userRepository.findWorkerProfileGovernments({ workerProfileId });
      return governments;
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
   * @param {IDType[] | undefined} params.mainSpecializationIds - IDs of the main specializations to get retreived
   */
  async getSpecializations({ workerProfileId, mainSpecializationIds = undefined }) {
    return tryCatch(async () => {

      const tree = await this.#userRepository.findWorkerProfileSpecializations({ workerProfileId, mainSpecializationIds });
      return tree;
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
        for (let { mainId, subIds } of specializationsTree) {
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
   * @param {import("../repositories/database/UserRepository.js").WorkerVerificationData} params.data
   * @returns {Promise<import("../repositories/database/UserRepository.js").WorkerVerificationFilter>}
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
   * @returns {Promise<import("../repositories/database/UserRepository.js").WorkerVerification>}
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
   * @param {import("../repositories/database/Repository.js").IDType} params.userId - User ID
   * @returns {Promise<import("../repositories/database/UserRepository.js").WorkerProfile>} Worker profile
   * @throws {AppError} If user not found
   */
  async get({ userId }) {
    return tryCatch(async () => {
      const workerProfile = await this.#userRepository.findWorkerProfile({ userId });
      if (!workerProfile)
        throw new AppError("Worker profile not found", 404);

      return workerProfile;
    });
  }
}
