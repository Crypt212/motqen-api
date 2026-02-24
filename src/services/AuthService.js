/**
 * @fileoverview User Service - Handle authentication
 * @module services/AuthService
 */

import AppError from "../errors/AppError.js";
import uploadToCloudinary from "../providers/cloudinaryProvider.js";
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
   * @param {string} params.middleName - User's middle name
   * @param {string} params.lastName - User's last name
   * @param {string} params.governmentId - Government ID
   * @param {string} params.city - City name
   * @param {string | null} params.profileImage - Profile image URL
   * @returns {Promise<Object>} Created user object
   * @throws {AppError} If government or city not found
   */
  async register({
    phoneNumber,
    firstName,
    middleName,
    lastName,
    governmentId,
    city,
    profileImage = null,
  }) {
    return tryCatch(async () => {
      /** @type {import('../types/role.js').Role} */
      const role = 'USER';


      const cityEntity = await governmentRepository.existsCity({name:city , governmentId});
      const cityEntities = await governmentRepository.findCities({});
      const cityId = cityEntities[0].id;
      // if(!cityEntity){
      //   throw new AppError("Government or City not found", 400);
      // }
      if(profileImage){
        // it will be user uuid instead of phoneNumber
        const {url} =await uploadToCloudinary(profileImage ,`${phoneNumber}/profile_image`,"profileMain");
        profileImage = url
      }
      const user = await userRepository.create({ phoneNumber, profileImage , role, firstName, middleName, lastName, governmentId, cityId, status: "ACTIVE" });

      return user;

    });
  }
}
