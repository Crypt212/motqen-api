import UserRepository from "../repositories/UserRepository.js";
import Service, { tryCatch } from "./Service.js";

const userRepository = new UserRepository();

/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 * @extends {Service}
 */

/**
 * User Service - Manages user-related operations
 * @class
 * @extends Service
 */
export default class UserService extends Service {
  /**
   * Get user information by phone number
   * @async
   * @method getUser
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} User object
   */
  async getUser(phoneNumber) {
    return tryCatch(async () => {
      const user = await userRepository.getByPhoneNumber(phoneNumber);
      return user;
    });
  };

  /**
   * Get user by ID
   * @async
   * @method getUserById
   * @param {string} userId - User's ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    return tryCatch(async () => {
      const user = await userRepository.getById(userId);
      return user;
    });
  };

  /**
   * Create a new user
   * @async
   * @method createUser
   * @param {Object} userData - User creation data
   * @param {string} userData.phoneNumber - User's phone number
   * @param {import('../types/role.js').Role} userData.role - User's role
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.government - User's government
   * @param {string} userData.city - User's city
   * @param {string} [userData.bio] - User's bio
   * @returns {Promise<Object>} Created user object
   */
  async createUser({ phoneNumber, role, firstName, lastName, government, city, bio }) {
    return tryCatch(async () => {
      return await userRepository.create({ phoneNumber, role, firstName, lastName, government, city, bio });
    });
  };

  /**
   * Get basic user information
   * @async
   * @method getBasicInfo
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} User object
   */
  async getBasicInfo(phoneNumber) {
    return tryCatch(async () => {
      return await this.getUser(phoneNumber);
    });
  }

  /**
   * Check if user is a worker
   * @async
   * @method isWorker
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<boolean>} True if user is a worker
   */
  async isWorker(phoneNumber) {
    return tryCatch(async () => {
      const user = await this.getUser(phoneNumber);
      return await userRepository.isWorker(user.id);
    });
  }

  /**
   * Update user's basic information by phone number
   * @async
   * @method updateBasicInfo
   * @param {string} phoneNumber - User's phone number
   * @param {Object} data - Update data
   * @param {import('../types/role.js').Role} [data.role] - User's role
   * @param {string} [data.firstName] - First name
   * @param {string} [data.lastName] - Last name
   * @param {string} [data.government] - Government
   * @param {string} [data.city] - City
   * @param {string} [data.bio] - Bio
   * @returns {Promise<void>}
   */
  async updateBasicInfo(phoneNumber, { role, firstName, lastName, government, city, bio }) {
    return tryCatch(async () => {
      const user = await this.getUser(phoneNumber);
      await userRepository.updateBasicInfo(user.id, { role, firstName, lastName, government, city, bio });
    });
  }

  /**
   * Update user's basic information by user ID
   * @async
   * @method updateBasicInfoById
   * @param {string} userId - User's ID
   * @param {Object} data - Update data
   * @param {import('../types/role.js').Role} [data.role] - User's role
   * @param {string} [data.firstName] - First name
   * @param {string} [data.lastName] - Last name
   * @param {string} [data.government] - Government
   * @param {string} [data.city] - City
   * @param {string} [data.bio] - Bio
   * @returns {Promise<void>}
   */
  async updateBasicInfoById(userId, { role, firstName, lastName, government, city, bio }) {
    return tryCatch(async () => {
      await userRepository.updateBasicInfo(userId, { role, firstName, lastName, government, city, bio });
    });
  }

  /**
   * Get worker's profile information
   * @async
   * @method getWorkerInfo
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<Object>} Worker info object
   */
  async getWorkerInfo(phoneNumber) {
    return tryCatch(async () => {
      const user = await this.getUser(phoneNumber);
      return await userRepository.getWorkerInfo(user.id);
    });
  }

  /**
   * Update worker's profile information by phone number
   * @async
   * @method updateWorkerInfo
   * @param {string} phoneNumber - User's phone number
   * @param {Object} data - Worker update data
   * @param {number} [data.experienceYears] - Years of experience
   * @param {boolean} [data.isInTeam] - Whether worker is in a team
   * @param {boolean} [data.acceptsUrgentJobs] - Whether worker accepts urgent jobs
   * @param {string} [data.primarySpecialization] - Primary specialization
   * @param {string[]} [data.secondarySpecializations] - Secondary specializations
   * @param {string[]} [data.governments] - Governments served
   * @returns {Promise<void>}
   */
  async updateWorkerInfo(phoneNumber, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    primarySpecialization,
    secondarySpecializations,
    governments
  }) {
    return tryCatch(async () => {
      const user = await this.getUser(phoneNumber);
      await userRepository.updateWorkerInfo(user.id, {
        experienceYears,
        isInTeam,
        acceptsUrgentJobs,
        primarySpecializationName: primarySpecialization,
        secondarySpecializationNames: secondarySpecializations,
        governmentNames: governments
      });
    });
  }

  /**
   * Update worker's profile information by user ID
   * @async
   * @method updateWorkerInfoById
   * @param {string} userId - User's ID
   * @param {Object} data - Worker update data
   * @param {number} [data.experienceYears] - Years of experience
   * @param {boolean} [data.isInTeam] - Whether worker is in a team
   * @param {boolean} [data.acceptsUrgentJobs] - Whether worker accepts urgent jobs
   * @param {string} [data.primarySpecialization] - Primary specialization
   * @param {string[]} [data.secondarySpecializations] - Secondary specializations
   * @param {string[]} [data.governments] - Governments served
   * @returns {Promise<void>}
   */
  async updateWorkerInfoById(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    primarySpecialization,
    secondarySpecializations,
    governments
  }) {
    return tryCatch(async () => {
      await userRepository.updateWorkerInfo(userId, {
        experienceYears,
        isInTeam,
        acceptsUrgentJobs,
        primarySpecializationName: primarySpecialization,
        secondarySpecializationNames: secondarySpecializations,
        governmentNames: governments
      });
    });
  }
}
