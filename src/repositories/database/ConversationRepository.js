/**
 * @fileoverview ConversationRepository - DB access for conversations and participants
 * @module repositories/database/ConversationRepository
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { Repository } from './Repository.js';

/** @typedef {import('./Repository.js').IDType} IDType */

/**
 * @typedef {{ workerId: IDType, clientId: IDType }} ConversationData
 * @typedef {{ conversationId: IDType, userId: IDType, role: import('@prisma/client').$Enums.ConversationRole }} ParticipantData
 */

/**
 * ConversationRepository — handles conversations and their participants
 * @class
 * @extends Repository
 */
export default class ConversationRepository extends Repository {
  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, 'conversation');
  }

  // ─── Conversation ─────────────────────────────────────────────────────────

  /**
   * Find a conversation between a specific worker and client.
   * @param {{ workerId: IDType, clientId: IDType }} params
   * @returns {Promise<import('@prisma/client').Conversation | null>}
   */
  async findByPair({ workerId, clientId }) {
    return this.prismaClient.conversation.findUnique({
      where: { workerId_clientId: { workerId, clientId } },
    });
  }

  /**
   * Create conversation + both participants in a single transaction.
   * Caller must ensure workerId has a workerProfile and clientId has a clientProfile.
   * @param {{ workerId: IDType, clientId: IDType }} params
   * @returns {Promise<{ conversation: import('@prisma/client').Conversation, participants: import('@prisma/client').ConversationParticipant[] }>}
   */
  async createWithParticipants({ workerId, clientId }) {
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
  }

  /**
   * Atomically increment the conversation's messageCounter and return the new value.
   * This is the authoritative way to get the next messageNumber.
   * @param {{ conversationId: IDType }} params
   * @returns {Promise<number>} The incremented messageCounter (= new messageNumber)
   */
  async incrementMessageCounter({ conversationId }) {
    const updated = await this.prismaClient.conversation.update({
      where: { id: conversationId },
      data: { messageCounter: { increment: 1 } },
      select: { messageCounter: true },
    });
    return updated.messageCounter;
  }

  /**
   * Find all conversations for a user, including derived unread count.
   * Only returns conversations that have at least 1 message.
   *
   * @param {{ userId: IDType, skip?: number, take?: number }} params
   * @returns {Promise<(import('@prisma/client').Conversation & { participants: (import('@prisma/client').ConversationParticipant & { user: import('@prisma/client').User })[], messages: import('@prisma/client').Message[] })[] >}
   */
  async findAllByUserId({ userId, skip = 0, take = 30 }) {
    const conversations = await this.prismaClient.conversation.findMany({
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
          take: 1, // last message preview
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
    });
    return conversations;
  }

  /**
   * Find conversation with participants, verify the requesting user is a member.
   * @param {{ conversationId: IDType, userId: IDType }} params
   * @returns {Promise<import('@prisma/client').Conversation & { participants: import('@prisma/client').ConversationParticipant[] } | null>}
   */
  async findWithParticipant({ conversationId, userId }) {
    return this.prismaClient.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId } },
      },
      include: { participants: true },
    });
  }

  // ─── Participant ───────────────────────────────────────────────────────────

  /**
   * Find a single participant row.
   * @param {{ conversationId: IDType, userId: IDType }} params
   * @returns {Promise<import('@prisma/client').ConversationParticipant | null>}
   */
  async findParticipant({ conversationId, userId }) {
    return this.prismaClient.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
  }

  /**
   * Update lastReadMessageNumber using GREATEST semantics (never decrements).
   * @param {{ conversationId: IDType, userId: IDType, messageNumber: number }} params
   * @returns {Promise<import('@prisma/client').ConversationParticipant>}
   */
  async updateLastRead({ conversationId, userId, messageNumber }) {
    // Prisma does not expose GREATEST natively; use updateMany with conditional
    // or a raw upsert. We leverage the fact that we always pass a valid number:
    // fetch current then update only if new value is higher — safe because
    // this is called from service layer which controls concurrency via GREATEST.
    return this.prismaClient.$queryRaw`
      UPDATE conversation_participants
      SET "lastReadMessageNumber" = GREATEST("lastReadMessageNumber", ${messageNumber})
      WHERE "conversationId" = ${conversationId} AND "userId" = ${userId}
      RETURNING *
    `.then((rows) => {
      if (!rows || rows.length === 0) {
        throw new Error(`Participant not found: conversationId=${conversationId}, userId=${userId}`);
      }
      return rows[0];
    });
  }

  /**
   * Update lastReceivedMessageNumber using GREATEST semantics (never decrements).
   * @param {{ conversationId: IDType, userId: IDType, messageNumber: number }} params
   * @returns {Promise<import('@prisma/client').ConversationParticipant>}
   */
  async updateLastReceived({ conversationId, userId, messageNumber }) {
    return this.prismaClient.$queryRaw`
      UPDATE conversation_participants
      SET "lastReceivedMessageNumber" = GREATEST("lastReceivedMessageNumber", ${messageNumber})
      WHERE "conversationId" = ${conversationId} AND "userId" = ${userId}
      RETURNING *
      `.then((rows) => {
      if (!rows || rows.length === 0) {
        throw new Error(`Participant not found: conversationId=${conversationId}, userId=${userId}`);
      }
      return rows[0];
    });
  }
}
