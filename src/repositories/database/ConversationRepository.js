/**
 * @fileoverview ConversationRepository - DB access for conversations and participants
 * @module repositories/database/ConversationRepository
 */

import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * ConversationRepository — handles conversations and their participants
 * @class
 * @extends Repository
 */
export default class ConversationRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Standard CRUD Operations
  // ============================================

  /**
   * Find conversation by ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.Conversation | null>}
   */
  async findById({ id }) {
    try {
      return await this.prismaClient.conversation.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'findById');
    }
  }

  /**
   * Find first conversation matching the criteria
   * @param {Object} params
   * @param {pkg.Prisma.ConversationWhereInput} [params.where]
   * @param {pkg.Prisma.ConversationInclude} [params.include]
   * @returns {Promise<pkg.Conversation | null>}
   */
  async findFirst({ where, include }) {
    try {
      return await this.prismaClient.conversation.findFirst({
        where,
        include,
      });
    } catch (error) {
      handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Check if conversation exists
   * @param {pkg.Prisma.ConversationCountArgs} filter
   * @returns {Promise<boolean>}
   */
  async exists(filter) {
    try {
      return (await this.prismaClient.conversation.count(filter)) > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Find many conversations with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.ConversationFindManyArgs} [params.filter]
   * @returns {Promise<pkg.Conversation[]>}
   */
  async findMany({ filter = {} }) {
    try {
      const data = await this.prismaClient.conversation.findMany(filter);
      return data;
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new conversation
   * @param {pkg.Prisma.ConversationCreateInput} data
   * @returns {Promise<pkg.Conversation>}
   */
  async create(data) {
    try {
      return await this.prismaClient.conversation.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Update a conversation
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @param {pkg.Prisma.ConversationUpdateInput} params.data
   * @returns {Promise<pkg.Conversation>}
   */
  async update({ id, data }) {
    try {
      return await this.prismaClient.conversation.update({
        where: { id },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'update');
    }
  }

  /**
   * Update many conversations
   * @param {pkg.Prisma.ConversationWhereInput} filter
   * @param {pkg.Prisma.ConversationUpdateInput} data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany(filter, data) {
    try {
      return await this.prismaClient.conversation.updateMany({
        where: filter,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete a conversation
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.Conversation>}
   */
  async delete({ id }) {
    try {
      return await this.prismaClient.conversation.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'delete');
    }
  }

  /**
   * Delete many conversations
   * @param {pkg.Prisma.ConversationWhereInput} filter
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany(filter) {
    try {
      return await this.prismaClient.conversation.deleteMany({
        where: filter,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  // ============================================
  // Conversation Operations
  // ============================================

  /**
   * Find a conversation between a specific worker and client.
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.workerId
   * @param {import('./Repository.js').IDType} params.clientId
   * @returns {Promise<pkg.Conversation | null>}
   */
  async findByPair({ workerId, clientId }) {
    try {
      return await this.prismaClient.conversation.findUnique({
        where: { workerId_clientId: { workerId, clientId } },
      });
    } catch (error) {
      handlePrismaError(error, 'findByPair');
    }
  }

  /**
   * Create conversation + both participants in a single transaction.
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.workerId
   * @param {import('./Repository.js').IDType} params.clientId
   * @returns {Promise<{ conversation: pkg.Conversation, participants: pkg.ConversationParticipant[] }>}
   */
  async createWithParticipants({ workerId, clientId }) {
    try {
      const conversation = await this.prismaClient.conversation.create({
        data: {
          workerId,
          clientId,
          participants: {
            createMany: {
              data: [
                { userId: workerId, role: 'WORKER' },
                { userId: clientId, role: 'CLIENT' },
              ],
            },
          },
        },
        include: { participants: true },
      });
      return { conversation, participants: conversation.participants };
    } catch (error) {
      handlePrismaError(error, 'createWithParticipants');
    }
  }

  /**
   * Atomically increment the conversation's messageCounter and return the new value.
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.conversationId
   * @returns {Promise<number>}
   */
  async incrementMessageCounter({ conversationId }) {
    try {
      const updated = await this.prismaClient.conversation.update({
        where: { id: conversationId },
        data: { messageCounter: { increment: 1 } },
        select: { messageCounter: true },
      });
      return updated.messageCounter;
    } catch (error) {
      handlePrismaError(error, 'incrementMessageCounter');
    }
  }

  /**
   * Find all conversations for a user
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {number} [params.skip]
   * @param {number} [params.take]
   * @returns {Promise<pkg.Prisma.ConversationGetPayload<{include: {messages: { orderBy: { createdAt: 'desc' }, take: 1, }, participants: {include: {user: true} }}}>[]>}
   */
  async findAllByUserId({ userId, skip = 0, take = 30 }) {
    try {
      return await this.prismaClient.conversation.findMany({
        where: {
          participants: { some: { userId } },
          messageCounter: { gt: 0 },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImageUrl: true,
                  isOnline: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      });
    } catch (error) {
      handlePrismaError(error, 'findAllByUserId');
    }
  }

  /**
   * Find conversation with participants, verify the requesting user is a member.
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.conversationId
   * @param {import('./Repository.js').IDType} params.userId
   * @returns {Promise<pkg.Conversation | null>}
   */
  async findWithParticipant({ conversationId, userId }) {
    try {
      return await this.prismaClient.conversation.findFirst({
        where: {
          id: conversationId,
          participants: { some: { userId } },
        },
        include: { participants: true },
      });
    } catch (error) {
      handlePrismaError(error, 'findWithParticipant');
    }
  }

  // ============================================
  // Participant Operations
  // ============================================

  /**
   * Find a single participant row.
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.conversationId
   * @param {import('./Repository.js').IDType} params.userId
   * @returns {Promise<pkg.ConversationParticipant | null>}
   */
  async findParticipant({ conversationId, userId }) {
    try {
      return await this.prismaClient.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
      });
    } catch (error) {
      handlePrismaError(error, 'findParticipant');
    }
  }

  /**
   * Update lastReadMessageNumber using GREATEST semantics (never decrements).
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.conversationId
   * @param {import('./Repository.js').IDType} params.userId
   * @param {number} params.messageNumber
   * @returns {Promise<any>}
   */
  async updateLastRead({ conversationId, userId, messageNumber }) {
    try {
      const rows = await this.prismaClient.$queryRaw`
        UPDATE conversation_participants
        SET "lastReadMessageNumber" = GREATEST("lastReadMessageNumber", ${messageNumber})
        WHERE "conversationId" = ${conversationId} AND "userId" = ${userId}
        RETURNING *
      `;
      if (
        !(typeof rows === 'object' && Array.isArray(rows)) ||
        rows.length === 0
      ) {
        throw new Error(
          `Participant not found: conversationId=${conversationId}, userId=${userId}`
        );
      }
      return rows[0];
    } catch (error) {
      handlePrismaError(error, 'updateLastRead');
    }
  }

  /**
   * Update lastReceivedMessageNumber using GREATEST semantics (never decrements).
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.conversationId
   * @param {import('./Repository.js').IDType} params.userId
   * @param {number} params.messageNumber
   * @returns {Promise<any>}
   */
  async updateLastReceived({ conversationId, userId, messageNumber }) {
    try {
      const rows = await this.prismaClient.$queryRaw`
        UPDATE conversation_participants
        SET "lastReceivedMessageNumber" = GREATEST("lastReceivedMessageNumber", ${messageNumber})
        WHERE "conversationId" = ${conversationId} AND "userId" = ${userId}
        RETURNING *
      `;
      if (
        !(typeof rows === 'object' && Array.isArray(rows)) ||
        rows.length === 0
      ) {
        throw new Error(
          `Participant not found: conversationId=${conversationId}, userId=${userId}`
        );
      }
      return rows[0];
    } catch (error) {
      handlePrismaError(error, 'updateLastReceived');
    }
  }
}
