/**
 * @fileoverview UserRepository - Database access for users
 * @module repositories/database/UserRepository
 */

import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * UserRepository — handles database operations for users
 * @class
 * @extends Repository
 */
export default class UserRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Standard CRUD Operations
  // ============================================

  /**
   * Find user by ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.User | null>}
   */
  async findById({ id }) {
    try {
      return await this.prismaClient.user.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'findById');
    }
  }

  /**
   * Find first user matching the criteria
   * @param {Object} params
   * @param {import('./Repository.js').IDType} [params.id]
   * @param {string} [params.phoneNumber]
   * @returns {Promise<pkg.User | null>}
   */
  async findFirst({ id, phoneNumber }) {
    try {
      const where = {
        ...(id && { id }),
        ...(phoneNumber && { phoneNumber }),
      }
      return await this.prismaClient.user.findFirst({
        where
      });
    } catch (error) {
      handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Check if user exists
   * @param {Object} params
   * @param {import('./Repository.js').IDType} [params.id]
   * @param {string} [params.phoneNumber]
   * @returns {Promise<boolean>}
   */
  async exists({ id, phoneNumber }) {
    try {
      const count = await this.prismaClient.user.count({
        where: {
          ...(id && { id }),
          ...(phoneNumber && { phoneNumber }),
        },
      });
      return count > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Find many users with pagination, filtering
   * @param {Object} params
   * @param {pkg.Prisma.UserFindManyArgs} [params.filter]
   * @returns {Promise<pkg.User[]>}
   */
  async findMany({ filter = {} }) {
    try {
      const data = await this.prismaClient.user.findMany(filter);
      return data;
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new user
   * @param {Object} params
   * @param {pkg.Prisma.UserCreateInput} params.data
   * @returns {Promise<pkg.User>}
   */
  async create({ data }) {
    try {
      return await this.prismaClient.user.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Create multiple users
   * @param {Object} params
   * @param {pkg.Prisma.UserCreateInput[]} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createMany({ data }) {
    try {
      return await this.prismaClient.user.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'createMany');
    }
  }

  /**
   * Update a user
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @param {pkg.Prisma.UserUpdateInput} params.data
   * @returns {Promise<pkg.User>}
   */
  async update({ id, data }) {
    try {
      return await this.prismaClient.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'update');
    }
  }

  /**
   * Update many users
   * @param {Object} params
   * @param {pkg.Prisma.UserWhereInput} params.where
   * @param {pkg.Prisma.UserUpdateInput} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany({ where, data }) {
    try {
      return await this.prismaClient.user.updateMany({
        where,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete a user
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.User>}
   */
  async delete({ id }) {
    try {
      return await this.prismaClient.user.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'delete');
    }
  }

  /**
   * Delete many users
   * @param {Object} params
   * @param {pkg.Prisma.UserWhereInput} params.where
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany({ where }) {
    try {
      return await this.prismaClient.user.deleteMany({
        where,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }
}
