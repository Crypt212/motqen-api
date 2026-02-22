/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 */

import { $Enums } from "@prisma/client";
import AppError from "../errors/AppError.js";
import { governmentRepository, userRepository } from "../state.js";
import Service, { tryCatch } from "./Service.js";
import { Repository } from "../repositories/Repository.js";

/** @typedef {import("../repositories/UserRepository.js").IDType} IDType */

/**
 * User Service - Manages user-related operations
 * @class
 * @extends Service
 */
export default class UserService extends Service {

  /**
   * Get a user by filter
   * @async
   * @method getUser
   * @param {import("../repositories/UserRepository.js").UserFilter} filter - User search filter
   * @returns {Promise<Object|null>} Found user or null
   */
  async getUser(filter) {
    return await userRepository.findOne(filter);
  }

  /**
   * Get all roles of a user
   * @async
   * @method getUserRoles
   * @param {import("../repositories/UserRepository.js").IDType} userId - User ID
   * @returns {Promise<{ isWorker: boolean, isClient: boolean }>} Roles of user
   */
  async getUserRoles(userId) {
    const isWorker = await userRepository.hasWorkerProfile(userId);
    const isClient = await userRepository.hasClientProfile(userId);
    return { isWorker, isClient };
  }

  /**
   * Update a user's basic information
   * @async
   * @method updateUser
   * @param {import("../repositories/UserRepository.js").IDType} userId - User ID
   * @param {Object} data - Update data
   * @param {$Enums.Role} [data.role] - User's role
   * @param {string} [data.firstName] - First name
   * @param {string} [data.lastName] - Last name
   * @param {string} [data.government] - Government name
   * @param {string} [data.city] - City name
   * @param {string} [data.bio] - Biography
   * @param {$Enums.AccountStatus} [data.status] - Account status
   * @returns {Promise<import("../repositories/UserRepository.js").User | null>} Updated user
   * @throws {AppError} If government or city not found
   */
  async updateUser(userId, data) {
    let governmentId = undefined;
    let cityId = undefined;
    if (data.government) {
      const government = await governmentRepository.findOne({ name: data.government });
      if (!government) throw new AppError("Government not found", 400);
      governmentId = government.id;

    }
    if (data.city) {
      const cities = await governmentRepository.findCities({ governmentId, name: data.city });
      if (!cities || cities.length === 0)
        throw new AppError("City not found", 400);
      cityId = cities[0].id;
    }

    await userRepository.update({ id: userId }, { role: data.role, firstName: data.firstName, lastName: data.lastName, governmentId, cityId, bio: data.bio, status: data.status });
    return await userRepository.findOne({ id: userId });
  }

  /**
   * Create a worker profile for a user
   * @async
   * @method createWorkerProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @param {Object} data - Worker profile data
   * @param {number} data.experienceYears - Years of experience
   * @param {boolean} data.isInTeam - Whether worker is in a team
   * @param {boolean} data.acceptsUrgentJobs - Whether worker accepts urgent jobs
   * @param {{mainId: IDType, subIds: IDType[]}[]} data.specializationsTree - List of specialization names
   * @param {IDType[]} data.governmentIds - List of government names where worker operates
   * @returns {Promise<import("../repositories/UserRepository.js").WorkerProfile>} Created worker profile
   * @throws {AppError} If user not found or invalid data
   */
  async createWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationsTree,
    governmentIds
  }) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      /** @type {import("../repositories/UserRepository.js").WorkerProfile} */
      let workerProfile;

      await Repository.createTransaction([userRepository], async () => {
        workerProfile = await userRepository.createWorkerProfile(userId, {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
        });

        await userRepository.addWorkerProfileGovernments(workerProfile.id, governmentIds);
        await userRepository.addWorkerProfileSpecializations(workerProfile.id, specializationsTree.map(({ mainId }) => mainId));
        for (let { mainId, subIds } of specializationsTree) {
          await userRepository.addWorkerProfileSubSpecializations(workerProfile.id, mainId, subIds);
        }

        return workerProfile;
      }, (reason) => {
        throw new AppError("Failed to create worker profile", 500, reason);
      });

      return workerProfile;
    });
  }

  /**
   * Create a client profile for a user
   * @async
   * @method createClientProfile
   * @param {Object} params - Client profile parameters
   * @param {import("../repositories/Repository.js").IDType} params.userId - User ID
   * @returns {Promise<import("../repositories/UserRepository.js").ClientProfile>} Created client profile
   * @throws {AppError} If user not found
   */
  async createClientProfile({
    userId,
  }) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);


      const clientProfile = await userRepository.createClientProfile(userId, {});
      return clientProfile;
    });
  }

  /**
   * Update a worker's profile information
   * @async
   * @method updateWorkerProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @param {Object} data - Worker profile data to update
   * @param {number} [data.experienceYears] - Years of experience
   * @param {boolean} [data.isInTeam] - Whether worker is in a team
   * @param {boolean} [data.acceptsUrgentJobs] - Whether worker accepts urgent jobs
   * @returns {Promise<import("../repositories/UserRepository.js").WorkerProfile>} Updated worker profile
   * @throws {AppError} If user not found
   */
  async updateWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
  }) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      return await userRepository.updateWorkerProfile(userId, {
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
  async insertWorkerProfileWorkGovernments(userId, governmentIds) {
    return tryCatch(async () => {

      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([userRepository], async () => {
        const { count } = await userRepository.addWorkerProfileGovernments(workerProfileId, governmentIds);
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

      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([userRepository], async () => {
        const { count } = await userRepository.deleteWorkerProfileGovernments(workerProfileId, governmentIds);
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
  async insertWorkerProfileSpecializations(userId, specializationsTree) {
    return tryCatch(async () => {

      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([userRepository], async () => {
        await userRepository.addWorkerProfileSpecializations(workerProfileId, specializationsTree.map(({ mainId }) => mainId));
        for (let { mainId, subIds } of specializationsTree) {
          await userRepository.addWorkerProfileSubSpecializations(workerProfileId, mainId, subIds);
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

      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      const { count } = await userRepository.deleteWorkerProfileSpecializations(workerProfileId, mainSpecializationIds);
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

      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await userRepository.getWorkerProfile(userId);
      if (!workerProfile) throw new AppError("Worker profile not found", 404);

      const workerProfileId = workerProfile.id;

      Repository.createTransaction([userRepository], async () => {
        for (let { mainId, subIds } of specializationsTree) {
          await userRepository.deleteWorkerProfileSubSpecializations(workerProfileId, mainId, subIds);
        }
      }, (error) => {
        throw new AppError("Failed to delete worker profile sub specializations", 400, error);
      });
    });
  }


  /**
   * Get a client's profile for a user
   * @async
   * @method getClientProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @returns {Promise<import("../repositories/UserRepository.js").ClientProfile>} Client profile
   * @throws {AppError} If user not found
   */
  async getClientProfile(userId) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const clientProfile = await userRepository.getClientProfile(userId);
      if (!clientProfile)
        throw new AppError("Client profile not found", 404);

      return clientProfile;
    });
  }

  /**
   * Update a client's profile for a user
   * @async
   * @method updateClientProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @param {Object} data - Client profile data to update
   * @returns {Promise<import("../repositories/UserRepository.js").ClientProfile>} Updated client profile
   * @throws {AppError} If user not found or profile not found
   */
  async updateClientProfile(userId, data = {}) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const clientProfile = await userRepository.getClientProfile(userId);
      if (!clientProfile)
        throw new AppError("Client profile not found", 404);

      return await userRepository.updateClientProfile(userId, data);
    });
  }

  /**
   * Get a worker's profile for a user
   * @async
   * @method getWorkerProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @returns {Promise<import("../repositories/UserRepository.js").WorkerProfile>} Worker profile
   * @throws {AppError} If user not found
   */
  async getWorkerProfile(userId) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfile = await userRepository.getWorkerProfile(userId);
      if (!workerProfile)
        throw new AppError("Worker profile not found", 404);

      return workerProfile;
    });
  }

  /**
   * Get user's profile image URL
   * @async
   * @method getProfileImage
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @returns {Promise<string|null>} Profile image URL or null
   * @throws {AppError} If user not found
   */
  async getProfileImage(userId) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      return (await userRepository.findOne({ id: userId })).profileImage;
    });
  }

  /**
   * Update user's profile image URL
   * For workers, the image will not be updated until approved by an admin
   * @async
   * @method updateProfileImage
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @param {string} profileImage - New profile image URL
   * @returns {Promise<import("../repositories/UserRepository.js").User>} Updated user
   * @throws {AppError} If user not found
   */
  async updateProfileImage(userId, profileImage) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      // Check if user has a worker profile - if so, they cannot update their profile image directly
      const isWorker = await userRepository.hasWorkerProfile(userId);
      if (isWorker) {
        throw new AppError("Worker profile image cannot be updated directly. Contact an admin for approval.", 403);
      }
      await userRepository.update({ id: userId }, { profileImage });
      return userRepository.findOne({ id: userId });
    });
  }

  /**
   * Delete user's profile image URL
   * Workers cannot delete their profile image
   * @async
   * @method deleteProfileImage
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @returns {Promise<import("../repositories/UserRepository.js").User>} Updated user with null profileImage
   * @throws {AppError} If user not found or is a worker
   */
  async deleteProfileImage(userId) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      // Check if user has a worker profile - workers cannot delete their profile image
      const isWorker = await userRepository.hasWorkerProfile(userId);
      if (isWorker) {
        throw new AppError("Workers cannot delete their profile image.", 403);
      }
      await userRepository.update({ id: userId }, { profileImage: null, });
      return userRepository.findOne({ id: userId });
    });
  }
}
