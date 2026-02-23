/**
 * @fileoverview Government Repository - Handle database operations for governments
 * @module repositories/GovernmentRepository
 */

import { Repository } from "./Repository.js";
import prisma from "../libs/database.js";

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{name: String}} GovernmentData */
/** @typedef {GovernmentData & { id: IDType }} Government */
/** @typedef {import("./Repository.js").FilterArgs<Government>} GovernmentFilter */

/** @typedef {{name: String}} CityData */
/** @typedef {CityData & { id: IDType, governmentId: IDType }} City */
/** @typedef {import("./Repository.js").FilterArgs<City>} CityFilter */


/**
 * Government Repository - Handles all database operations for governments
 * @class
 * @extends Repository
 */
export default class GovernmentRepository extends Repository {

  constructor() {
    super(prisma);
  }

  /**
   * @async
   * @method
   * @param {GovernmentFilter} where
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    return (await this.prismaClient.government.count({ where })) > 0;
  }


  /**
   * @async
   * @method
   * @param {GovernmentFilter} where
   * @returns {Promise<Government |null>}
   */
  async findOne(where) {
    return await this.prismaClient.government.findFirst({ where });
  };

  /**
   * @async
   * @method
   * @param {GovernmentFilter} where
   * @returns {Promise<Government[]>}
   */
  async findMany(where) {
    return await this.prismaClient.government.findMany({ where });
  };

  /**
   * @async
   * @method
   * @param {GovernmentData} data
   * @returns {Promise<Government>}
   */
  async create(data) {
    return await this.prismaClient.government.create({ data });
  };

  /**
   * @async
   * @method
   * @param {GovernmentData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async createMany(data) {
    return await this.prismaClient.government.createMany({ data });
  };

  /**
   * @async
   * @method
   * @param {GovernmentFilter} filter
   * @param {GovernmentData} data
   * @returns {Promise<BatchPayload>}
   */
  async update(filter, data) {
    return await this.prismaClient.government.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {GovernmentFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async delete(filter) {
    return await this.prismaClient.government.deleteMany({
      where: filter,
    });
  };

  // Handling Cities ----------------------------------------------------

  /**
   * @async
   * @method
   * @param {CityFilter} filter
   * @returns {Promise<boolean>}
   */
  async existsCity(filter ) {
    return (await this.prismaClient.city.count({ where: filter})) > 0;
  }

  /**
   * @async
   * @method
   * @param {CityFilter} filter
   * @returns {Promise<City[]>}
   */
  async findCities(filter) {
    return await this.prismaClient.city.findMany({
      where: filter
    });
  };

  /**
   * @async
   * @method
   * @param {CityFilter} filter
   * @param {CityData} data
   * @returns {Promise<BatchPayload>}
   */
  async updateCities(filter, data) {
    return await this.prismaClient.city.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {IDType} governmentId
   * @param {CityData} data
   * @returns {Promise<BatchPayload>}
   */
  async createCities(governmentId, data) {
    return await this.prismaClient.city.createMany({
      data: {
        ...data,
        governmentId
      },
    });
  };

  /**
   * @async
   * @method
   * @param {CityFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async deleteCities(filter) {
    return await this.prismaClient.city.deleteMany({
      where: filter
    });
  };

};
