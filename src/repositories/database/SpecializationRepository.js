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
   * Find specialization by ID
   * @param {pkg.Prisma.SpecializationFindFirstArgs} filter
   * @returns {Promise<pkg.Specialization | null>}
   */
  async findFirst(filter) {
    try {
      return await this.prismaClient.specialization.findFirst(filter);
    } catch (error) {
      handlePrismaError(error, 'findFirst');
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
   * Update first specialization matching filter
   * @param {Object} params
   * @param {pkg.Prisma.SpecializationWhereInput} params.where
   * @param {pkg.Prisma.SpecializationUpdateInput} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async update({ where, data }) {
    try {
      return await this.prismaClient.specialization.updateMany({
        where,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Update specializations matching filter
   * @param {Object} params
   * @param {pkg.Prisma.SpecializationWhereInput} params.where
   * @param {pkg.Prisma.SpecializationUpdateInput} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany({ where, data }) {
    try {
      return await this.prismaClient.specialization.updateMany({
        where,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete specializations matching filter
   * @param {pkg.Prisma.SpecializationDeleteManyArgs} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async delete(filter) {
    try {
      return await this.prismaClient.specialization.deleteMany(filter);
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  /**
   * Delete specializations matching filter
   * @param {pkg.Prisma.SpecializationDeleteManyArgs} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany(filter) {
    try {
      return await this.prismaClient.specialization.deleteMany(filter);
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
   * Find sub-specialization
   * @param {Object} params
   * @param {pkg.Prisma.SubSpecializationFindFirstArgs} [params.filter]
   * @returns {Promise<pkg.SubSpecialization>}
   */
  async findSubSpecialization({ filter }) {
    try {

      const subSpecialization = await this.prismaClient.subSpecialization.findFirst(filter);
      return subSpecialization;
    } catch (error) {
      handlePrismaError(error, 'findSubSpecializations');
    }
  }

  /**
   * Update sub-specialization
   * @param {pkg.Prisma.SubSpecializationWhereUniqueInput} where
   * @param {pkg.Prisma.SubSpecializationUpdateInput} data
   * @returns {Promise<pkg.SubSpecialization>}
   */
  async updateSubSpecialization(where, data) {
    try {
      return await this.prismaClient.subSpecialization.update({ where, data, });
    } catch (error) {
      handlePrismaError(error, 'updateSubSpecializations');
    }
  }

  /**
   * Create sub-specialization
   * @param {string} mainSpecializationId
   * @param {pkg.Prisma.SubSpecializationCreateInput} data
   * @returns {Promise<pkg.SubSpecialization>}
   */
  async createSubSpecialization(mainSpecializationId, data) {
    try {
      data.mainSpecialization = { connect: { id: mainSpecializationId } };
      return await this.prismaClient.subSpecialization.create({ data });
    } catch (error) {
      handlePrismaError(error, 'createSubSpecializations');
    }
  }

  /**
   * Delete sub-specialization
   * @param {pkg.Prisma.SubSpecializationDeleteArgs} filter
   * @returns {Promise<pkg.SubSpecialization>}
   */
  async deleteSubSpecialization(filter) {
    try {
      return await this.prismaClient.subSpecialization.delete(filter);
    } catch (error) {
      handlePrismaError(error, 'deleteSubSpecializations');
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
   * @param {pkg.Prisma.SubSpecializationWhereInput} where
   * @param {pkg.Prisma.SubSpecializationUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateSubSpecializations(where, data) {
    try {
      return await this.prismaClient.subSpecialization.updateMany({ where, data, });
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
   * @param {pkg.Prisma.SubSpecializationDeleteManyArgs} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteSubSpecializations(filter) {
    try {
      return await this.prismaClient.subSpecialization.deleteMany(filter);
    } catch (error) {
      handlePrismaError(error, 'deleteSubSpecializations');
    }
  }
}
