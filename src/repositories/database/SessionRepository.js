import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * @fileoverview Session Repository - Handle database operations for sessions
 * @module repositories/SessionRepository
 * @extends {Repository}
 */

/**
 * Session Repository - Handles all database operations for sessions
 * @class
 * @extends Repository
 */
export default class SessionRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Standard CRUD Operations
  // ============================================

  /**
   * Find session by ID
   * @param {Object} params
   * @param {string} params.id
   * @returns {Promise<pkg.Session | null>}
   */
  async findById({ id }) {
    try {
      return await this.prismaClient.session.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'findById');
    }
  }

  /**
   * Find session by token
   * @param {Object} params
   * @param {string} params.token
   * @returns {Promise<pkg.Session | null>}
   */
  async findByToken({ token }) {
    try {
      return await this.prismaClient.session.findUnique({
        where: { token },
      });
    } catch (error) {
      handlePrismaError(error, 'findByToken');
    }
  }

  /**
   * Find first session matching filter
   * @param {pkg.Prisma.SessionWhereInput} filter
   * @returns {Promise<pkg.Session | null>}
   */
  async findFirst(filter) {
    try {
      return await this.prismaClient.session.findFirst({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Check if session exists
   * @param {pkg.Prisma.SessionCountArgs} filter
   * @returns {Promise<boolean>}
   */
  async exists(filter) {
    try {
      return (await this.prismaClient.session.count(filter)) > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Count sessions matching filter
   * @param {pkg.Prisma.SessionCountArgs} filter
   * @returns {Promise<number>}
   */
  async count(filter) {
    try {
      return await this.prismaClient.session.count(filter);
    } catch (error) {
      handlePrismaError(error, 'count');
    }
  }

  /**
   * Find many sessions with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.SessionFindManyArgs} [params.filter]
   * @param {import('./Repository.js').PaginationOptions} [params.pagination]
   * @param {boolean} [params.paginate]
   * @returns {Promise<{ data: pkg.Session[], pagination: import('./Repository.js').PaginatedResult }>}
   */
  async findMany({ filter = {}, pagination = undefined }) {
    try {
      const query = { ...filter };
      let paginationResult = undefined;

      if (pagination) {
        const total = await this.prismaClient.session.count({
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

      const data = await this.prismaClient.session.findMany(query);
      return { data, pagination: paginationResult };
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new session
   * @param {pkg.Prisma.SessionCreateInput} data
   * @returns {Promise<pkg.Session>}
   */
  async create(data) {
    try {
      return await this.prismaClient.session.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Create multiple sessions
   * @param {pkg.Prisma.SessionCreateManyInput[]} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createMany(data) {
    try {
      return await this.prismaClient.session.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'createMany');
    }
  }

  /**
   * Update a session
   * @param {Object} params
   * @param {string} params.id
   * @param {pkg.Prisma.SessionUpdateInput} params.data
   * @returns {Promise<pkg.Session>}
   */
  async update({ id, data }) {
    try {
      return await this.prismaClient.session.update({
        where: { id },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'update');
    }
  }

  /**
   * Update sessions matching filter
   * @param {pkg.Prisma.SessionWhereInput} filter
   * @param {pkg.Prisma.SessionUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany(filter, data) {
    try {
      return await this.prismaClient.session.updateMany({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete a session
   * @param {Object} params
   * @param {string} params.id
   * @returns {Promise<pkg.Session>}
   */
  async delete({ id }) {
    try {
      return await this.prismaClient.session.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'delete');
    }
  }

  /**
   * Delete sessions matching filter
   * @param {pkg.Prisma.SessionWhereInput} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany(filter) {
    try {
      return await this.prismaClient.session.deleteMany({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  /**
   * Revoke a session by ID
   * @param {Object} params
   * @param {string} params.id
   * @returns {Promise<pkg.Session>}
   */
  async revoke({ id }) {
    try {
      return await this.prismaClient.session.update({
        where: { id },
        data: { isRevoked: true },
      });
    } catch (error) {
      handlePrismaError(error, 'revoke');
    }
  }

  /**
   * Revoke all sessions for a user
   * @param {Object} params
   * @param {string} params.userId
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async revokeAllForUser({ userId }) {
    try {
      return await this.prismaClient.session.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    } catch (error) {
      handlePrismaError(error, 'revokeAllForUser');
    }
  }
}
