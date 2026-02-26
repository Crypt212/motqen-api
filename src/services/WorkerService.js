/**
 * @fileoverview Worker Service - Handle worker operations
 * @module services/WorkerService
 */

import AppError from "../errors/AppError.js";
import Service, { tryCatch } from "./Service.js";
import { Repository } from "../repositories/database/Repository.js";
import UserRepository from "../repositories/database/UserRepository.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";

/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */

/**
 * Worker Service - Manages worker-related operations
 * @class
 * @extends Service
 */
export default class WorkerService extends Service {

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
   * Create a worker profile for a user
   * @async
   * @method createWorkerProfile
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @param {Object} data - Worker profile data
   * @param {number} data.experienceYears - Years of experience
   * @param {boolean} data.isInTeam - Whether worker is in a team
   * @param {boolean} data.acceptsUrgentJobs - Whether worker accepts urgent jobs
   * @param {{ mainId: string, subIds: string[] }[]} data.specializationsTree - Tree of main specialization and sub specializations
   * @param {IDType[]} data.governmentIds - List of government names where worker operates
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} data.profileImage - Profile image URL
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} data.idImage - ID image URL
   * @param {Express.Multer.File & import("../types/asyncHandler.js").MulterFile} data.profileWithIdImage - Profile with ID image URL
   * @returns {Promise<import("../repositories/database/UserRepository.js").WorkerProfile>} Created worker profile
   * @throws {AppError} If user not found or invalid data
   */
  async createWorkerProfile(userId, {
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
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      /** @type {import("../repositories/database/UserRepository.js").WorkerProfile} */
      let workerProfile;

      await Repository.createTransaction([this.#userRepository], async () => {
        workerProfile = await this.#userRepository.addWorkerProfile(userId, {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
        });

        await this.#userRepository.addWorkerProfileGovernments(workerProfile.id, governmentIds);
        await this.#userRepository.addWorkerProfileSpecializations(workerProfile.id, specializationsTree.map(({ mainId }) => mainId));
        for (let { mainId, subIds } of specializationsTree) {
          await this.#userRepository.addWorkerProfileSubSpecializations(workerProfile.id, mainId, subIds);
        }

        const nationalID = (await uploadToCloudinary(idImage, `${userId}/verification_info`, "nationalID")).url
        const selfiWithID = (await uploadToCloudinary(profileWithIdImage, `${userId}/verification_info`, "selfiWithID")).url

        await this.#userRepository.addVerificationInfo(workerProfile.id, {
          idWithPersonalImageUrl: selfiWithID,
          idDocumentUrl: nationalID,
          status: "APPROVED"// untill dashboard emplement
        })

        await this.#userRepository.update({ profileImageUrl: (await uploadToCloudinary(profileImage, `${user.phoneNumber}/profile_image`, "profileMain")).url }, { id: user.id });

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
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @param {Object} data - Worker profile data to update
   * @param {number} [data.experienceYears] - Years of experience
   * @param {boolean} [data.isInTeam] - Whether worker is in a team
   * @param {boolean} [data.acceptsUrgentJobs] - Whether worker accepts urgent jobs
   * @returns {Promise<import("../repositories/database/UserRepository.js").WorkerProfile>} Updated worker profile
   * @throws {AppError} If user not found
   */
  async updateWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
  }) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      return await this.#userRepository.updateWorkerProfile(userId, {
        experienceYears,
        isInTeam,
        acceptsUrgentJobs,
      });
    });
  }

  /**
   * Insert working governments for worker
   * @async
   * @method insertWorkerProfileWorkGovernments
   * @param {IDType} userId - User ID
   * @param {IDType[]} governmentIds - Ids of working governments
   * @returns {Promise<Number>} Number of inserted governments
   */
  async addWorkerProfileWorkGovernments(userId, governmentIds) {
    return tryCatch(async () => {

      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await this.#userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([this.#userRepository], async () => {
        const { count } = await this.#userRepository.addWorkerProfileGovernments(workerProfileId, governmentIds);
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
   * @param {IDType} userId - User ID
   * @param {IDType[]} governmentIds - Ids of working governments
   * @returns {Promise<Number>} Number of deleted governments
   */
  async deleteProfileWorkGovernments(userId, governmentIds) {
    return tryCatch(async () => {

      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await this.#userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([this.#userRepository], async () => {
        const { count } = await this.#userRepository.deleteWorkerProfileGovernments(workerProfileId, governmentIds);
        return count;
      }, (error) => {
        throw new AppError("Failed to insert worker profile governments", 400, error);
      });
    });
  }

  /**
   * Insert specialization tree for worker
   * @async
   * @method insertWorkerProfileSpecializations
   * @param {IDType} userId - User ID
   * @param {{mainId: IDType, subIds: IDType[]}[]} specializationsTree - Tree of main and sub specializations
   */
  async addWorkerProfileSpecializations(userId, specializationsTree) {
    return tryCatch(async () => {

      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await this.#userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([this.#userRepository], async () => {
        await this.#userRepository.addWorkerProfileSpecializations(workerProfileId, specializationsTree.map(({ mainId }) => mainId));
        for (let { mainId, subIds } of specializationsTree) {
          await this.#userRepository.addWorkerProfileSubSpecializations(workerProfileId, mainId, subIds);
        }
      }, (error) => {
        throw new AppError("Failed to insert worker profile specializations", 400, error);
      });
    });
  }

  /**
   * Delete main specializations
   * @async
   * @method deleteWorkerProfileMainSpecializations
   * @param {IDType} userId - User ID
   * @param {IDType[]} mainSpecializationIds - IDs of main specializations to be deleted
   * @returns {Promise<Number>} Number of deleted main specializations
   */
  async deleteWorkerProfileMainSpecializations(userId, mainSpecializationIds) {
    return tryCatch(async () => {

      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await this.#userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      const { count } = await this.#userRepository.deleteWorkerProfileSpecializations(workerProfileId, mainSpecializationIds);
      return count;
    });
  }

  /**
   * Delete sub specializations
   * @async
   * @method deleteWorkerProfileSubSpecializations
   * @param {IDType} userId - User ID
   * @param {{mainId: IDType, subIds: IDType[]}[]} specializationsTree - Tree of main and sub specializations
   * @returns {Promise<Number>} Number of deleted sub specializations
   */
  async deleteWorkerProfileSubSpecializations(userId, specializationsTree) {
    return tryCatch(async () => {

      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await this.#userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([this.#userRepository], async () => {
        for (let { mainId, subIds } of specializationsTree) {
          await this.#userRepository.deleteWorkerProfileSubSpecializations(workerProfileId, mainId, subIds);
        }
      }, (error) => {
        throw new AppError("Failed to delete worker profile sub specializations", 400, error);
      });
    });
  }

  /**
   * Get a worker's profile for a user
   * @async
   * @method getWorkerProfile
   * @param {import("../repositories/database/Repository.js").IDType} userId - User ID
   * @returns {Promise<import("../repositories/database/UserRepository.js").WorkerProfile>} Worker profile
   * @throws {AppError} If user not found
   */
  async getWorkerProfile(userId) {
    return tryCatch(async () => {
      const user = await this.#userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await this.#userRepository.getWorkerProfile(userId);
      if (!workerProfile)
        throw new AppError("Worker profile not found", 404);

      return workerProfile;
    });
  }
}
