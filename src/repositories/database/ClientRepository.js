/**
 * @fileoverview ClientRepository - Database access for client profiles
 * @module repositories/database/ClientRepository
 */

import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * ClientRepository — handles database operations for client profiles
 * @class
 * @extends Repository
 */
export default class ClientRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Standard CRUD Operations
  // ============================================

  /**
   * Find client profile by ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.ClientProfile | null>}
   */
  async findById({ id }) {
    try {
      return await this.prismaClient.clientProfile.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'findById');
    }
  }

  /**
   * Find first client profile matching the criteria
   * @param {Object} params
   * @param {import('./Repository.js').IDType} [params.userId]
   * @returns {Promise<pkg.ClientProfile | null>}
   */
  async findFirst({ userId }) {
    try {
      return await this.prismaClient.clientProfile.findFirst({
        where: {
          ...(userId && { userId }),
        },
      });
    } catch (error) {
      handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Check if client profile exists
   * @param {Object} params
   * @param {import('./Repository.js').IDType} [params.id]
   * @param {import('./Repository.js').IDType} [params.userId]
   * @returns {Promise<boolean>}
   */
  async exists({ id, userId }) {
    try {
      const count = await this.prismaClient.clientProfile.count({
        where: {
          ...(id && { id }),
          ...(userId && { userId }),
        },
      });
      return count > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Find many client profiles with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.ClientProfileFindManyArgs} [params.filter]
   * @returns {Promise<pkg.ClientProfile[]>}
   */
  async findMany({ filter = {}, }) {
    try {
      const data = await this.prismaClient.clientProfile.findMany(filter);
      return data;
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new client profile
   * @param {Object} params
   * @param {pkg.Prisma.ClientProfileCreateInput} params.data
   * @returns {Promise<pkg.ClientProfile>}
   */
  async create({ data }) {
    try {
      return await this.prismaClient.clientProfile.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Create multiple client profiles
   * @param {Object} params
   * @param {pkg.Prisma.ClientProfileCreateManyInput} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createMany({ data }) {
    try {
      return await this.prismaClient.clientProfile.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'createMany');
    }
  }

  /**
   * Update a client profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @param {pkg.Prisma.ClientProfileUpdateInput} params.data
   * @returns {Promise<pkg.ClientProfile>}
   */
  async update({ id, data }) {
    try {
      return await this.prismaClient.clientProfile.update({
        where: { id },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'update');
    }
  }

  /**
   * Update many client profiles
   * @param {Object} params
   * @param {pkg.Prisma.ClientProfileWhereInput} params.where
   * @param {pkg.Prisma.ClientProfileUpdateInput} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany({ where, data }) {
    try {
      return await this.prismaClient.clientProfile.updateMany({
        where,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete a client profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.ClientProfile>}
   */
  async delete({ id }) {
    try {
      return await this.prismaClient.clientProfile.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'delete');
    }
  }

  /**
   * Delete many client profiles
   * @param {Object} params
   * @param {pkg.Prisma.ClientProfileWhereInput} params.where
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany({ where }) {
    try {
      return await this.prismaClient.clientProfile.deleteMany({
        where,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  // ============================================
  // User-based Operations
  // ============================================

  /**
   * Find client profile by user ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @returns {Promise<pkg.ClientProfile | null>}
   */
  async findByUserId({ userId }) {
    try {
      return await this.prismaClient.clientProfile.findUnique({
        where: { userId },
      });
    } catch (error) {
      handlePrismaError(error, 'findByUserId');
    }
  }

  /**
   * Create a client profile for existing user
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {pkg.Prisma.ClientProfileCreateInput} params.data
   * @returns {Promise<pkg.ClientProfile>}
   */
  async createByUserId({ userId, data }) {
    try {
      return await this.prismaClient.clientProfile.create({
        data: {
          ...data,
          user: { connect: { id: userId } },
        },
      });
    } catch (error) {
      handlePrismaError(error, 'createByUserId');
    }
  }

  /**
   * Update client profile by user ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {pkg.Prisma.ClientProfileUpdateInput} params.data
   * @returns {Promise<pkg.ClientProfile>}
   */
  async updateByUserId({ userId, data }) {
    try {
      return await this.prismaClient.clientProfile.update({
        where: { userId },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateByUserId');
    }
  }

  /**
   * Delete client profile by user ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @returns {Promise<pkg.ClientProfile>}
   */
  async deleteByUserId({ userId }) {
    try {
      return await this.prismaClient.clientProfile.delete({
        where: { userId },
      });
    } catch (error) {
      handlePrismaError(error, 'deleteByUserId');
    }
  }
}
