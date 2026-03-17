/**
 * @fileoverview MessageRepository - DB access for chat messages
 * @module repositories/database/MessageRepository
 */

import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * MessageRepository — handles all message DB operations
 * @class
 * @extends Repository
 */
export default class MessageRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Standard CRUD Operations
  // ============================================

  /**
   * Find first message matching filter
   * @param {pkg.Prisma.MessageWhereInput} filter
   * @returns {Promise<pkg.Message | null>}
   */
  async findFirst(filter) {
    try {
      return await this.prismaClient.message.findFirst({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Check if message exists
   * @param {pkg.Prisma.MessageCountArgs} filter
   * @returns {Promise<boolean>}
   */
  async exists(filter) {
    try {
      return (await this.prismaClient.message.count(filter)) > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Find many messages with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.MessageFindManyArgs} [params.filter]
   * @param {import('./Repository.js').PaginationOptions} [params.pagination]
   * @param {boolean} [params.paginate]
   * @returns {Promise<{ data: pkg.Message[], pagination: import('./Repository.js').PaginatedResult }>}
   */
  async findMany({ filter = {}, pagination = undefined }) {
    try {
      const query = { ...filter };
      let paginationResult = undefined;

      if (pagination) {
        const total = await this.prismaClient.message.count({
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

      const data = await this.prismaClient.message.findMany(query);
      return { data, pagination: paginationResult };
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new message
   * @param {pkg.Prisma.MessageCreateInput} data
   * @returns {Promise<pkg.Message>}
   */
  async create(data) {
    try {
      return await this.prismaClient.message.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Create multiple messages
   * @param {pkg.Prisma.MessageCreateManyInput[]} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createMany(data) {
    try {
      return await this.prismaClient.message.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'createMany');
    }
  }

  /**
   * Update messages matching filter
   * @param {pkg.Prisma.MessageWhereInput} filter
   * @param {pkg.Prisma.MessageUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany(filter, data) {
    try {
      return await this.prismaClient.message.updateMany({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete messages matching filter
   * @param {pkg.Prisma.MessageWhereInput} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany(filter) {
    try {
      return await this.prismaClient.message.deleteMany({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  /**
   * Insert a new message. Must be called inside a Prisma transaction after
   * incrementing the conversation counter.
   * @param {Object} params
   * @param {string} params.conversationId
   * @param {string} params.senderId
   * @param {number} params.messageNumber
   * @param {string} params.content
   * @param {pkg.$Enums.MessageType} [params.type]
   * @returns {Promise<pkg.Message>}
   */
  async insertMessage({
    conversationId,
    senderId,
    messageNumber,
    content,
    type = 'TEXT',
  }) {
    try {
      return await this.prismaClient.message.create({
        data: { conversationId, senderId, messageNumber, content, type },
      });
    } catch (error) {
      handlePrismaError(error, 'insertMessage');
    }
  }

  /**
   * Fetch a single message by its UUID
   * @param {Object} params
   * @param {string} params.messageId
   * @returns {Promise<pkg.Message | null>}
   */
  async findById({ messageId }) {
    try {
      return await this.prismaClient.message.findUnique({
        where: { id: messageId },
      });
    } catch (error) {
      handlePrismaError(error, 'findById');
    }
  }

  /**
   * Cursor-based pagination: fetch messages after a given messageNumber (exclusive).
   * @param {Object} params
   * @param {string} params.conversationId
   * @param {number} [params.after]
   * @param {number} [params.limit]
   * @returns {Promise<pkg.Message[]>}
   */
  async findPage({ conversationId, after = 0, limit = 30 }) {
    try {
      return await this.prismaClient.message.findMany({
        where: {
          conversationId,
          messageNumber: { gt: after },
        },
        orderBy: { messageNumber: 'asc' },
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      });
    } catch (error) {
      handlePrismaError(error, 'findPage');
    }
  }

  /**
   * Fetch the latest N messages in a conversation
   * @param {Object} params
   * @param {string} params.conversationId
   * @param {number} [params.limit]
   * @returns {Promise<pkg.Message[]>}
   */
  async findLatest({ conversationId, limit = 30 }) {
    try {
      const rows = await this.prismaClient.message.findMany({
        where: { conversationId },
        orderBy: { messageNumber: 'desc' },
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      });
      return rows.reverse();
    } catch (error) {
      handlePrismaError(error, 'findLatest');
    }
  }
}
