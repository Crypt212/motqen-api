/**
 * @fileoverview Government Repository - Handle database operations for governments
 * @module repositories/GovernmentRepository
 */

import { handlePrismaError, Repository } from "./Repository.js";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import('./Repository.js').PaginationOptions} PaginationOptions */
/** @typedef {import('./Repository.js').OrderingOptions} OrderingOptions */
/** @template T @typedef {import('./Repository.js').PaginatedResult<T>} PaginatedResult */

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


  // ============================================
  // City CRUD Operations
  // ============================================

  /**
   * Check if city exists
   * @param {CityFilter} filter
   * @returns {Promise<boolean>}
   * @throws {RepositoryError}
   */
  async existsCity(filter) {
    try {
      return (await this.prismaClient.city.count({ where: filter })) > 0;
    } catch (error) {
      handlePrismaError(error, 'existsCity');
    }
  }

  /**
   * Find cities with flexible filtering, pagination, and ordering
   * @param {Object} params - Query parameters
   * @param {CityFilter} [params.filter] - Filter criteria
   * @param {PaginationOptions} [params.pagination] - Pagination options
   * @param {OrderingOptions[]} [params.orderBy] - Ordering options
   * @param {boolean} [params.paginate] - Whether to return paginated results
   * @returns {Promise<PaginatedResult<City>>}
   */
  async findCities({
    filter = {},
    pagination,
    orderBy = [],
    paginate = false
  }) {
    try {
      return Repository.performFindManyQuery({
        prismaModel: this.prismaClient.city,
        parentQueryParameters: { governmentId: filter.governmentId },
        orderBy,
        filter,
        paginate,
        pagination,
        mapFunction: (x) => x,
      });
    } catch (error) {
      throw handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Find cities (legacy method for backward compatibility)
   * @param {CityFilter} filter
   * @returns {Promise<City[]>}
   * @throws {RepositoryError}
   */
  async findCitiesLegacy(filter) {
    try {
      return await this.prismaClient.city.findMany({
        where: filter
      });
    } catch (error) {
      handlePrismaError(error, 'findCitiesLegacy');
    }
  }

  /**
   * Update cities
   * @param {CityFilter} filter
   * @param {CityData} data
   * @returns {Promise<BatchPayload>}
   * @throws {RepositoryError}
   */
  async updateCities(filter, data) {
    try {
      return await this.prismaClient.city.updateMany({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateCities');
    }
  }

  /**
   * Create cities
   * @param {IDType} governmentId
   * @param {CityData} data
   * @returns {Promise<BatchPayload>}
   * @throws {RepositoryError}
   */
  async createCities(governmentId, data) {
    try {
      return await this.prismaClient.city.createMany({
      data: {
        ...data,
        governmentId
      },
    });
    } catch (error) {
      handlePrismaError(error, 'createCities');
    }
  }

  /**
   * Delete cities
   * @param {CityFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async deleteCities(filter) {
    return await this.prismaClient.city.deleteMany({
      where: filter
    });
  };
}
