/**
 * @fileoverview User Service - Handle authentication
 * @module services/AuthService
 */

import AppError from "../errors/AppError.js";
import { governmentRepository, userRepository } from "../state.js";
import Service, { tryCatch } from "./Service.js";

/**
 * Auth Service
 * @class
 * @extends Service
 */
export default class AuthService extends Service {

  /**
   * Register a new user
   * @async
   * @method register
   * @param {Object} params - User registration data
   * @param {string} params.phoneNumber - User's phone number
   * @param {string} params.firstName - User's first name
   * @param {string} params.lastName - User's last name
   * @param {string} params.government - Government name
   * @param {string} params.city - City name
   * @param {string} [params.bio] - User's biography
   * @returns {Promise<Object>} Created user object
   * @throws {AppError} If government or city not found
   */
  async register({
    phoneNumber,
    firstName,
    lastName,
    government,
    city,
    bio,
  }) {
    return tryCatch(async () => {

      /** @type {import('../types/role.js').Role} */
      const role = 'USER';
      let governmentId, cityId;

      {
        const governmentEntity = await governmentRepository.findOne({ name: government });
        if (!governmentEntity)
          throw new AppError("Government not found", 400);
        governmentId = governmentEntity.id;

        const cities = await governmentRepository.findCities({ governmentId, name: city });
        if (cities.length === 0)
          throw new AppError("City not found", 400);
        cityId = cities[0].id;
      }

      const user = await userRepository.create({ phoneNumber, role, firstName, lastName, governmentId, cityId, bio, status: "ACTIVE" });
      return user;

    });
  }
}
