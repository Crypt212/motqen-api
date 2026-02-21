/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 */

import { $Enums } from "@prisma/client";
import AppError from "../errors/AppError.js";
import UserRepository from "../repositories/UserRepository.js";
import { governmentRepository, specializationRepository } from "../state.js";
import Service, { tryCatch } from "./Service.js";
import prisma from "../libs/database.js";
import { Repository } from "../repositories/Repository.js";

const userRepository = new UserRepository();

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
   * @returns {Promise<Object>} Updated user
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

    return await userRepository.update({ id: userId }, { role: data.role, firstName: data.firstName, lastName: data.lastName, governmentId, cityId, bio: data.bio, status: data.status });
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
   * @param {string[]} data.specializationNames - List of specialization names
   * @param {string[]} [data.subSpecializationNames] - List of sub-specialization names
   * @param {string[]} data.governmentNames - List of government names where worker operates
   * @returns {Promise<Object>} Created worker profile
   * @throws {AppError} If user not found or invalid data
   */
  async createWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationNames,
    subSpecializationNames,
    governmentNames
  }) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const governmentEntities = await governmentRepository.findMany({ name: { in: governmentNames } });
      if (governmentNames.length !== governmentEntities.length)
        throw new AppError("One or more governments were not found in the database", 404);

      const chosenSpecializations = await specializationRepository.findMany({ name: { in: specializationNames } });
      if (specializationNames.length !== chosenSpecializations.length)
        throw new AppError("One or more specialization were not found in the database", 404);

      const subSpecializations = await specializationRepository.findSubSpecializations({
        name: { in: subSpecializationNames },
        mainSpecializationId: { in: chosenSpecializations.map(({ id }) => id) }
      });


      const specializationTree = {};
      for (const { id, mainSpecializationId } of subSpecializations) {
        if (!(mainSpecializationId in specializationTree)) specializationTree[mainSpecializationId] = [];
        specializationTree[mainSpecializationId].push(id);
      }

      if (subSpecializations.length !== subSpecializationNames.length)
        throw new AppError("One or more sub-specialization were not found for the provided main specializations in the database", 404);

      /** @type {import("../repositories/UserRepository.js").WorkerProfile} */
      let workerProfile;

      Repository.createTransaction([ userRepository ], async () => {
        workerProfile = await userRepository.createWorkerProfile(userId, {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
        });

        await userRepository.addWorkerProfileGovernments(workerProfile.id, governmentEntities.map(government => government.id));
        await userRepository.addWorkerProfileSpecializations(workerProfile.id, chosenSpecializations.map(specialization => specialization.id));
        for (let [mainSpecializationId, childrenSpecializationIds] of Object.entries(specializationTree))
          await userRepository.addWorkerProfileSubSpecializations(workerProfile.id, mainSpecializationId, childrenSpecializationIds);
      }, (reason) => {
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
   * @returns {Promise<Object>} Created client profile
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
   * @returns {Promise<Object>} Updated worker profile
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
   * Get a client's profile for a user
   * @async
   * @method getClientProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @returns {Promise<Object>} Client profile
   * @throws {AppError} If user not found
   */
  async getClientProfile(userId) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const clientProfiles = await userRepository.getClientProfile(userId);
      if (!clientProfiles || clientProfiles.length === 0)
        throw new AppError("Client profile not found", 404);

      return clientProfiles[0];
    });
  }

  /**
   * Update a client's profile for a user
   * @async
   * @method updateClientProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @param {Object} data - Client profile data to update
   * @returns {Promise<Object>} Updated client profile
   * @throws {AppError} If user not found or profile not found
   */
  async updateClientProfile(userId, data = {}) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const clientProfiles = await userRepository.getClientProfile(userId);
      if (!clientProfiles || clientProfiles.length === 0)
        throw new AppError("Client profile not found", 404);

      return await userRepository.updateClientProfile(userId, data);
    });
  }

  /**
   * Get a worker's profile for a user
   * @async
   * @method getWorkerProfile
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @returns {Promise<Object>} Worker profile
   * @throws {AppError} If user not found
   */
  async getWorkerProfile(userId) {
    return tryCatch(async () => {
      const user = await userRepository.findOne({ id: userId });
      if (!user) throw new AppError("User not found", 404);

      const workerProfiles = await userRepository.getWorkerProfile(userId);
      if (!workerProfiles || workerProfiles.length === 0)
        throw new AppError("Worker profile not found", 404);

      return workerProfiles[0];
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
   * @returns {Promise<Object>} Updated user
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

      return await userRepository.update({ id: userId }, { profileImage });
    });
  }

  /**
   * Delete user's profile image URL
   * Workers cannot delete their profile image
   * @async
   * @method deleteProfileImage
   * @param {import("../repositories/Repository.js").IDType} userId - User ID
   * @returns {Promise<Object>} Updated user with null profileImage
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

      return await userRepository.update({ id: userId }, { profileImage: null, });
    });
  }
}
