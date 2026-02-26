/**
 * @fileoverview Government Repository - Handle database operations for governments
 * @module repositories/GovernmentRepository
 */

import { Repository } from "./Repository.js";
import { PrismaClient } from "@prisma/client";

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{name: String }} GovernmentData */
/** @typedef {GovernmentData & { id: IDType }} Government */
/** @typedef {Partial<GovernmentData>} OptionalGovernmentData */
/** @typedef {import("./Repository.js").FilterArgs<Government>} GovernmentFilter */

/** @typedef {{name: String }} CityData */
/** @typedef {CityData & { id: IDType, governmentId: IDType }} City */
/** @typedef {import("./Repository.js").FilterArgs<City>} CityFilter */


/**
 * Government Repository - Handles all database operations for governments
 * @class
 * @extends Repository<GovernmentData, OptionalGovernmentData, Government, GovernmentFilter>
 */
export default class GovernmentRepository extends Repository {

  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, "government");
  }


  /**
   * @async
   * @method
   * @param {CityFilter} filter
   * @returns {Promise<boolean>}
   */
  async existsCity(filter) {
    return (await this.prismaClient.city.count({ where: filter })) > 0;
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
