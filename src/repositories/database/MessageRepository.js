/**
 * @fileoverview MessageRepository - DB access for chat messages
 * @module repositories/database/MessageRepository
 */

import { PrismaClient } from '@prisma/client';
import { Repository } from './Repository.js';

/** @typedef {import('./Repository.js').IDType} IDType */
/** @typedef {import('@prisma/client').$Enums.MessageType} MessageType */

/**
 * MessageRepository — handles all message DB operations
 * @class
 * @extends Repository
 */
export default class MessageRepository extends Repository {
  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, 'message');
  }

  /**
   * Insert a new message. Must be called inside a Prisma transaction after
   * incrementing the conversation counter.
   * @param {{ conversationId: IDType, senderId: IDType, messageNumber: number, content: string, type?: MessageType }} params
   * @returns {Promise<import('@prisma/client').Message>}
   */
  async insertMessage({ conversationId, senderId, messageNumber, content, type = 'TEXT' }) {
    return this.prismaClient.message.create({
      data: { conversationId, senderId, messageNumber, content, type },
    });
  }

  /**
   * Fetch a single message by its UUID — used to validate lastMessageId in markAsRead.
   * @param {{ messageId: IDType }} params
   * @returns {Promise<import('@prisma/client').Message | null>}
   */
  async findById({ messageId }) {
    return this.prismaClient.message.findUnique({ where: { id: messageId } });
  }

  /**
   * Cursor-based pagination: fetch messages after a given messageNumber (exclusive).
   * Returns results in ascending order (oldest first in page).
   * @param {{ conversationId: IDType, after?: number, limit?: number }} params
   * @returns {Promise<import('@prisma/client').Message[]>}
   */
  async findPage({ conversationId, after = 0, limit = 30 }) {
    return this.prismaClient.message.findMany({
      where: {
        conversationId,
        messageNumber: { gt: after },
      },
      orderBy: { messageNumber: 'asc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, profileImageUrl: true },
        },
      },
    });
  }

  /**
   * Fetch the latest N messages in a conversation — used for initial load.
   * @param {{ conversationId: IDType, limit?: number }} params
   * @returns {Promise<import('@prisma/client').Message[]>}
   */
  async findLatest({ conversationId, limit = 30 }) {
    const rows = await this.prismaClient.message.findMany({
      where: { conversationId },
      orderBy: { messageNumber: 'desc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, profileImageUrl: true },
        },
      },
    });
    // return in ascending order for the client
    return rows.reverse();
  }
}
