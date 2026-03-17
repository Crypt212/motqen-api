/**
 * @fileoverview Government Repository - Handle database operations for governments
 * @module repositories/GovernmentRepository
 */

import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * Government Repository - Handles all database operations for governments
 * @class
 * @extends Repository
 */
export default class GovernmentRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Government CRUD Operations
  // ============================================

  /**
   * Check if government exists
   * @param {pkg.Prisma.GovernmentCountArgs} filter
   * @returns {Promise<boolean>}
   */
  async exists(filter) {
    try {
      return (await this.prismaClient.government.count(filter)) > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Find first government matching filter
   * @param {pkg.Prisma.GovernmentWhereInput} filter
   * @returns {Promise<pkg.Government | null>}
   */
  async findFirst(filter) {
    try {
      const data = await this.prismaClient.government.findFirst({
        where: filter,
      });
        return data;
    } catch (error) {
      handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Find governments with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.GovernmentFindManyArgs} [params.filter]
   * @param {import('./Repository.js').PaginationOptions} [params.pagination]
   * @param {boolean} [params.paginate]
   * @returns {Promise<{ data: pkg.Government[], pagination: import('./Repository.js').PaginatedResult }>}
   */
  async findMany({ filter = {}, pagination = undefined }) {
    try {
      const query = { ...filter };
      let paginationResult = undefined;

      if (pagination) {
        const total = await this.prismaClient.government.count({
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

      const data = await this.prismaClient.government.findMany(query);
      return { data, pagination: paginationResult };
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new government
   * @param {pkg.Prisma.GovernmentCreateInput} data
   * @returns {Promise<pkg.Government>}
   */
  async create(data) {
    try {
      return await this.prismaClient.government.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Create multiple governments
   * @param {pkg.Prisma.GovernmentCreateManyInput[]} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createMany(data) {
    try {
      return await this.prismaClient.government.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'createMany');
    }
  }

  /**
   * Update government matching filter
   * @param {pkg.Prisma.GovernmentWhereUniqueInput} filter
   * @param {pkg.Prisma.GovernmentUpdateArgs} data
   * @returns {Promise<pkg.Government>}
   */
  async update(filter, data) {
    try {
      return await this.prismaClient.government.update({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Update governments matching filter
   * @param {pkg.Prisma.GovernmentWhereInput} filter
   * @param {pkg.Prisma.GovernmentUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany(filter, data) {
    try {
      return await this.prismaClient.government.updateMany({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete government matching filter
   * @param {pkg.Prisma.GovernmentWhereUniqueInput} filter
   * @returns {Promise<pkg.Government>}
   */
  async delete(filter) {
    try {
      return await this.prismaClient.government.delete({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  /**
   * Delete governments matching filter
   * @param {pkg.Prisma.GovernmentWhereInput} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany(filter) {
    try {
      return await this.prismaClient.government.deleteMany({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  // ============================================
  // City CRUD Operations
  // ============================================

  /**
   * Check if city exists
   * @param {pkg.Prisma.CityCountArgs} filter
   * @returns {Promise<boolean>}
   */
  async existsCity(filter) {
    try {
      return (await this.prismaClient.city.count(filter)) > 0;
    } catch (error) {
      handlePrismaError(error, 'existsCity');
    }
  }

  /**
   * Find city
   * @param {Object} params
   * @param {pkg.Prisma.CityFindFirstArgs} [params.filter]
   * @returns {Promise<pkg.City>}
   */
  async findCity({ filter = {} }) {
    try {
      const data = await this.prismaClient.city.findFirst(filter);
      return data;
    } catch (error) {
      handlePrismaError(error, 'findCities');
    }
  }

  /**
   * Update cities
   * @param {pkg.Prisma.CityWhereUniqueInput} filter
   * @param {pkg.Prisma.CityUpdateInput} data
   * @returns {Promise<pkg.City>}
   */
  async updateCity(filter, data) {
    try {
      return await this.prismaClient.city.update({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateCities');
    }
  }

  /**
   * Create cities
   * @param {string} governmentId
   * @param {pkg.Prisma.CityCreateInput} data
   * @returns {Promise<pkg.City>}
   */
  async createCity(governmentId, data) {
    try {
      data.government = { connect: { id: governmentId } };
      return await this.prismaClient.city.create({ data });
    } catch (error) {
      handlePrismaError(error, 'createCities');
    }
  }

  /**
   * Delete cities
   * @param {pkg.Prisma.CityWhereUniqueInput} filter
   * @returns {Promise<pkg.City>}
   */
  async deleteCity(filter) {
    try {
      return await this.prismaClient.city.delete({ where: filter, });
    } catch (error) {
      handlePrismaError(error, 'deleteCities');
    }
  }

  /**
   * Find cities with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.CityFindManyArgs} [params.filter]
   * @param {import('./Repository.js').PaginationOptions} [params.pagination]
   * @param {boolean} [params.paginate]
   * @returns {Promise<{ data: pkg.City[], pagination: import('./Repository.js').PaginatedResult }>}
   */
  async findCities({ filter = {}, pagination = undefined }) {
    try {
      const query = { ...filter };
      let paginationResult = undefined;

      if (pagination) {
        const total = await this.prismaClient.city.count({
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

      const data = await this.prismaClient.city.findMany(query);
      return { data, pagination: paginationResult };
    } catch (error) {
      handlePrismaError(error, 'findCities');
    }
  }

  /**
   * Update cities
   * @param {pkg.Prisma.CityWhereInput} filter
   * @param {pkg.Prisma.CityUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
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
   * @param {string} governmentId
   * @param {pkg.Prisma.CityCreateManyInput[]} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createCities(governmentId, data) {
    try {
      return await this.prismaClient.city.createMany({
        data: data.map((city) => ({
          ...city,
          governmentId,
        })),
      });
    } catch (error) {
      handlePrismaError(error, 'createCities');
    }
  }

  /**
   * Delete cities
   * @param {pkg.Prisma.CityWhereInput} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteCities(filter) {
    try {
      return await this.prismaClient.city.deleteMany({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteCities');
    }
  }
}
