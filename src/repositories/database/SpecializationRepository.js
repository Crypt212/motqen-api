/**
 * @fileoverview Specialization Repository - Handle database operations for specializations
 * @module repositories/SpecializationRepository
 */

import { handlePrismaError, Repository } from "./Repository.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;


/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import("./Repository.js").BatchPayload} BatchPayload */
/** @typedef {import('./Repository.js').PaginationOptions} PaginationOptions */
/** @typedef {import('./Repository.js').OrderingOptions} OrderingOptions */
/** @template T @typedef {import('./Repository.js').PaginatedResult<T>} PaginatedResult */

/** @typedef {{name: String}} SpecializationData */
/** @typedef {SpecializationData & { id: IDType }} Specialization */
/** @typedef {Partial<SpecializationData>} OptionalSpecializationData */
/** @typedef {import("./Repository.js").FilterArgs<Specialization>} SpecializationFilter */

/** @typedef {{name: String}} SubSpecializationData */
/** @typedef {SubSpecializationData & { id: IDType, mainSpecializationId: IDType }} SubSpecialization */
/** @typedef {import("./Repository.js").FilterArgs<SubSpecialization>} SubSpecializationFilter */


/**
 * Specialization Repository - Handles all database operations for specializations and their sub-specializations
 * @class
 * @extends Repository<SpecializationData, OptionalSpecializationData, Specialization, SpecializationFilter>
 */
export default class SpecializationRepository extends Repository {

  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, "specialization");
  }

  // ============================================
  // Sub-Specialization Operations
  // ============================================

  /**
   * Check if sub-specialization exists
   * @param {SubSpecializationFilter} filter
   * @returns {Promise<boolean>}
   */
  async existsSubSpecialization(filter) {
    return (await this.prismaClient.subSpecialization.count({ where: filter })) > 0;
  }

  /**
   * Find sub-specializations with flexible filtering, pagination, and ordering
   * @param {Object} params - Query parameters
   * @param {SubSpecializationFilter} [params.filter] - Filter criteria
   * @param {PaginationOptions} [params.pagination] - Pagination options
   * @param {OrderingOptions[]} [params.orderBy] - Ordering options
   * @param {boolean} [params.paginate] - Whether to return paginated results
   * @returns {Promise<PaginatedResult<SubSpecialization>>}
   */
  async findSubSpecializations({
    filter = {},
    pagination,
    orderBy = [],
    paginate = false
  }) {
    try {
      return Repository.performFindManyQuery({
        prismaModel: this.prismaClient.subSpecialization,
        parentQueryParameters: { mainSpecializationId: filter.mainSpecializationId },
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
   * Find sub-specializations (legacy method for backward compatibility)
   * @param {SubSpecializationFilter} filter
   * @returns {Promise<SubSpecialization[]>}
   */
  async findSubSpecializationsLegacy(filter) {
    return await this.prismaClient.subSpecialization.findMany({
      where: filter
    });
  }

  /**
   * Update sub-specializations
   * @param {SubSpecializationFilter} filter
   * @param {SubSpecializationData} data
   * @returns {Promise<BatchPayload>}
   */
  async updateSubSpecializations(filter, data) {
    return await this.prismaClient.subSpecialization.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * Create sub-specializations
   * @param {IDType} mainSpecializationId
   * @param {SubSpecializationData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async createSubSpecializations(mainSpecializationId, data) {
    return await this.prismaClient.subSpecialization.createMany({
      data: data.map((subSpecialization) => ({
        mainSpecializationId,
        ...subSpecialization
      })),
    });
  };

  /**
   * Delete sub-specializations
   * @param {SubSpecializationFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async deleteSubSpecializations(filter) {
    return await this.prismaClient.subSpecialization.deleteMany({
      where: filter
    });
  };
}
