/**
 * @fileoverview Specialization Repository - Handle database operations for specializations
 * @module repositories/SpecializationRepository
 */

import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * Specialization Repository - Handles all database operations for specializations and their sub-specializations
 * @class
 * @extends Repository
 */
export default class SpecializationRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Specialization CRUD Operations
  // ============================================

  /**
   * Find specialization by ID
   * @param {Object} params
   * @param {string} params.id
   * @returns {Promise<pkg.Specialization | null>}
   */
  async findById({ id }) {
    try {
      return await this.prismaClient.specialization.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'findById');
    }
  }

  /**
   * Check if specialization exists
   * @param {pkg.Prisma.SpecializationCountArgs} filter
   * @returns {Promise<boolean>}
   */
  async exists(filter) {
    try {
      return (await this.prismaClient.specialization.count(filter)) > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Find specializations with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.SpecializationFindManyArgs} [params.filter]
   * @param {import('./Repository.js').PaginationOptions} [params.pagination]
   * @param {boolean} [params.paginate]
   * @returns {Promise<{ data: pkg.Specialization[], pagination: import('./Repository.js').PaginatedResult }>}
   */
  async findMany({ filter = {}, pagination = undefined }) {
    try {
      const query = { ...filter };
      let paginationResult = undefined;

      if (pagination) {
        const total = await this.prismaClient.specialization.count({
          where: query.where,
        });
        const res = Repository.handlePagination({
          total,
          pagination,
        });
        const paginationQuery = res.paginationQuery;
        paginationResult = res.paginationResult;

        query.skip = paginationQuery.skip;
        query.take = paginationQuery.take;
      }

      const data = await this.prismaClient.specialization.findMany(query);
      return { data, pagination: paginationResult };
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new specialization
   * @param {pkg.Prisma.SpecializationCreateInput} data
   * @returns {Promise<pkg.Specialization>}
   */
  async create(data) {
    try {
      return await this.prismaClient.specialization.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Create multiple specializations
   * @param {pkg.Prisma.SpecializationCreateManyInput[]} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createMany(data) {
    try {
      return await this.prismaClient.specialization.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'createMany');
    }
  }

  /**
   * Update specializations matching filter
   * @param {pkg.Prisma.SpecializationWhereInput} filter
   * @param {pkg.Prisma.SpecializationUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany(filter, data) {
    try {
      return await this.prismaClient.specialization.updateMany({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete specializations matching filter
   * @param {pkg.Prisma.SpecializationWhereInput} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany(filter) {
    try {
      return await this.prismaClient.specialization.deleteMany({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  // ============================================
  // Sub-Specialization Operations
  // ============================================

  /**
   * Check if sub-specialization exists
   * @param {pkg.Prisma.SubSpecializationCountArgs} filter
   * @returns {Promise<boolean>}
   */
  async existsSubSpecialization(filter) {
    try {
      return (await this.prismaClient.subSpecialization.count(filter)) > 0;
    } catch (error) {
      handlePrismaError(error, 'existsSubSpecialization');
    }
  }

  /**
   * Find sub-specializations with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.SubSpecializationFindManyArgs} [params.filter]
   * @param {import('./Repository.js').PaginationOptions} [params.pagination]
   * @param {boolean} [params.paginate]
   * @returns {Promise<{ data: pkg.SubSpecialization[], pagination: import('./Repository.js').PaginatedResult }>}
   */
  async findSubSpecializations({ filter = {}, pagination = undefined }) {
    try {
      const query = { ...filter };
      let paginationResult = undefined;

      if (pagination) {
        const total = await this.prismaClient.subSpecialization.count({
          where: query.where,
        });
        const res = Repository.handlePagination({
          total,
          pagination,
        });
        const paginationQuery = res.paginationQuery;
        paginationResult = res.paginationResult;

        query.skip = paginationQuery.skip;
        query.take = paginationQuery.take;
      }

      const data = await this.prismaClient.subSpecialization.findMany(query);
      return { data, pagination: paginationResult };
    } catch (error) {
      handlePrismaError(error, 'findSubSpecializations');
    }
  }

  /**
   * Update sub-specializations
   * @param {pkg.Prisma.SubSpecializationWhereInput} filter
   * @param {pkg.Prisma.SubSpecializationUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateSubSpecializations(filter, data) {
    try {
      return await this.prismaClient.subSpecialization.updateMany({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateSubSpecializations');
    }
  }

  /**
   * Create sub-specializations
   * @param {string} mainSpecializationId
   * @param {pkg.Prisma.SubSpecializationCreateManyInput[]} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createSubSpecializations(mainSpecializationId, data) {
    try {
      return await this.prismaClient.subSpecialization.createMany({
        data: data.map((subSpecialization) => ({
          mainSpecializationId,
          ...subSpecialization,
        })),
      });
    } catch (error) {
      handlePrismaError(error, 'createSubSpecializations');
    }
  }

  /**
   * Delete sub-specializations
   * @param {pkg.Prisma.SubSpecializationWhereInput} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteSubSpecializations(filter) {
    try {
      return await this.prismaClient.subSpecialization.deleteMany({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteSubSpecializations');
    }
  }
}
