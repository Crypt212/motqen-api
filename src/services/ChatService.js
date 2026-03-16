/**
 * @fileoverview ChatService - Business logic for real-time chat
 * @module services/ChatService
 */

import AppError from '../errors/AppError.js';
import Service, { tryCatch } from './Service.js';
import ConversationRepository from '../repositories/database/ConversationRepository.js';
import MessageRepository from '../repositories/database/MessageRepository.js';
import UserRepository from '../repositories/database/UserRepository.js';
import ChatPresenceCache from '../repositories/cache/ChatPresenceCache.js';
import prisma from '../libs/database.js';

/** @typedef {import('../repositories/database/Repository.js').IDType} IDType */

/**
 * ChatService — all chat business logic (conversation creation, messaging, read state)
 * @class
 * @extends Service
 */
export default class ChatService extends Service {
  /** @type {ConversationRepository} */
  #conversationRepository;
  /** @type {MessageRepository} */
  #messageRepository;
  /** @type {UserRepository} */
  #userRepository;
  /** @type {ChatPresenceCache} */
  #presence;

  /**
   * @param {Object} params
   * @param {ConversationRepository} params.conversationRepository
   * @param {MessageRepository}      params.messageRepository
   * @param {UserRepository}         params.userRepository
   * @param {ChatPresenceCache}      params.presence
   */
  constructor({ conversationRepository, messageRepository, userRepository, presence }) {
    super();
    this.#conversationRepository = conversationRepository;
    this.#messageRepository = messageRepository;
    this.#userRepository = userRepository;
    this.#presence = presence;
  }

  // ─── Conversation ──────────────────────────────────────────────────────────

  /**
   * Get or create the conversation between a Worker and a Client.
   * Validates that workerId has a workerProfile and clientId has a clientProfile.
   * Returns the existing conversation if the pair already has one (idempotent).
   *
   * @param {{ workerId: IDType, clientId: IDType }} params
   * @returns {Promise<import('@prisma/client').Conversation>}
   * @throws {AppError} 400 if profiles are missing or same user is both roles
   * @throws {AppError} 409 if DB race creates duplicate (caught from UNIQUE constraint)
   */
  async getOrCreateConversation({ workerId, clientId }) {
    if (workerId === clientId)
      throw new AppError('A user cannot start a conversation with themselves', 400);

    // Validate roles at the profile level
    const [workerProfile, clientProfile] = await Promise.all([
      this.#userRepository.findWorkerProfile({ userId: workerId }),
      this.#userRepository.findClientProfile({ userId: clientId }),
    ]);

    if (!workerProfile)
      throw new AppError('Worker profile not found', 400);
    if (!clientProfile)
      throw new AppError('Client profile not found', 400);

    // Check if conversation already exists
    const existing = await this.#conversationRepository.findByPair({
      workerId,
      clientId,
    });
    if (existing) return existing;

    // Create the conversation + both participant rows atomically
    try {
      const { conversation } =
        await this.#conversationRepository.createWithParticipants({
          workerId,
          clientId,
        });
      return conversation;
    } catch (err) {
      // P2002 = UNIQUE constraint violation — race condition, another request
      // already created this conversation. Return the existing one.
      if (err.code === 'P2002') {
        const existing = await this.#conversationRepository.findByPair({
          workerId,
          clientId,
        });
        if (existing) return existing;
      }
      throw err;
    }
  }

  /**
   * List all conversations for a user with derived unreadCount.
   * @param {{ userId: IDType, skip?: number, take?: number }} params
   * @returns {Promise<{ id: IDType, messageCounter: number, unreadCount: number, lastMessage: import('@prisma/client').Message | null, partner: import('@prisma/client').User | null, createdAt: Date, updatedAt: Date}[]>}
   */
  async getConversations({ userId, skip = 0, take = 30 }) {
    return tryCatch(async () => {
      const convs = await this.#conversationRepository.findAllByUserId({
        userId,
        skip,
        take,
      });

      const conversations = convs.map((conv) => {
        const myParticipant = conv.participants.find((p) => p.userId === userId);
        const partnerParticipant = conv.participants.find((p) => p.userId !== userId);
        const unreadCount = Math.max(0, conv.messageCounter - (myParticipant?.lastReadMessageNumber ?? 0));

        return {
          id: conv.id,
          messageCounter: conv.messageCounter,
          unreadCount,
          lastMessage: conv.messages[0] ?? null,
          partner: partnerParticipant?.user ?? null,
          partnerLastReceivedMessageNumber: partnerParticipant?.lastReceivedMessageNumber ?? 0,
          partnerLastReadMessageNumber: partnerParticipant?.lastReadMessageNumber ?? 0,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      });

      return conversations;
    });
  }

  // ─── Messaging ─────────────────────────────────────────────────────────────

  /**
   * Send a message — atomically increments the counter and inserts the message
   * in a single Prisma transaction.
   *
   * The caller (socket handler) is responsible for:
   *   - validating the sender is a participant (DB-based, before calling this)
   *   - emitting the message to the recipient room
   *   - checking presence and auto-updating lastReadMessageNumber if inChat
   *
   * @param {{ conversationId: IDType, senderId: IDType, content: string, type?: import('@prisma/client').$Enums.MessageType }} params
   * @returns {Promise<import('@prisma/client').Message>}
   */
  async sendMessage({ conversationId, senderId, content, type = 'TEXT' }) {
    return tryCatch(async () => {
      if (!content?.trim())
        throw new AppError('Message content cannot be empty', 400);
      if (content.length > 2000)
        throw new AppError('Message content cannot exceed 2000 characters', 400);

      const message = await prisma.$transaction(async (tx) => {
        // Atomic increment — returns new counter value
        const updated = await tx.conversation.update({
          where: { id: conversationId },
          data: { messageCounter: { increment: 1 } },
          select: { messageCounter: true },
        });
        const messageNumber = updated.messageCounter;

        // Insert the message with that number
        return tx.message.create({
          data: { conversationId, senderId, messageNumber, content, type },
        });
      });

      // Sender always "receives" their own message
      await this.#conversationRepository.updateLastReceived({
        conversationId,
        userId: senderId,
        messageNumber: message.messageNumber,
      });

      return message;
    });
  }

  // ─── Read State ────────────────────────────────────────────────────────────

  /**
   * Mark messages as read up to and including `lastMessageId`.
   * Validates that the message belongs to the conversation (prevents cross-conv attacks).
   * Uses GREATEST so the value never decrements.
   *
   * @param {{ conversationId: IDType, userId: IDType, lastMessageId: IDType }} params
   * @returns {Promise<{ readUpTo: number }>}
   * @throws {AppError} 404 if message not found
   * @throws {AppError} 400 if message belongs to a different conversation
   */
  async markAsRead({ conversationId, userId, lastMessageId }) {
    return tryCatch(async () => {
      const message = await this.#messageRepository.findById({ messageId: lastMessageId });
      if (!message) throw new AppError('Message not found', 404);
      if (message.conversationId !== conversationId)
        throw new AppError('Message does not belong to this conversation', 400);

      await this.#conversationRepository.updateLastRead({
        conversationId,
        userId,
        messageNumber: message.messageNumber,
      });

      return { readUpTo: message.messageNumber };
    });
  }

  /**
   * Auto-mark all messages as read up to the conversation's current messageCounter.
   * Called when a user enters a chat screen.
   * @param {{ conversationId: IDType, userId: IDType }} params
   * @returns {Promise<void>}
   */
  async markAllAsRead({ conversationId, userId }) {
    return tryCatch(async () => {
      const conv = await this.#conversationRepository.findFirst({ id: conversationId });
      if (!conv) throw new AppError('Conversation not found', 404);

      // Reading implies receiving — bump both counters
      await Promise.all([
        this.#conversationRepository.updateLastRead({
          conversationId,
          userId,
          messageNumber: conv.messageCounter,
        }),
        this.#conversationRepository.updateLastReceived({
          conversationId,
          userId,
          messageNumber: conv.messageCounter,
        }),
      ]);
    });
  }

  // ─── Message Pagination ────────────────────────────────────────────────────

  /**
   * Paginated message history — cursor-based by messageNumber.
   * @param {{ conversationId: IDType, userId: IDType, after?: number, limit?: number }} params
   * @returns {Promise<import('@prisma/client').Message[]>}
   */
  async getMessages({ conversationId, userId, after = 0, limit = 30 }) {
    return tryCatch(async () => {
      // Validate participation (DB truth)
      const participant = await this.#conversationRepository.findParticipant({ conversationId, userId });
      if (!participant) throw new AppError('Conversation not found', 404);

      return this.#messageRepository.findPage({ conversationId, after, limit });
    });
  }

  /**
   * Missed messages since a given messageNumber (for offline catch-up).
   * @param {{ conversationId: IDType, userId: IDType, afterMessageNumber: number }} params
   * @returns {Promise<import('@prisma/client').Message[]>}
   */
  async getMissedMessages({ conversationId, userId, afterMessageNumber }) {
    return tryCatch(async () => {
      const participant = await this.#conversationRepository.findParticipant({ conversationId, userId });
      if (!participant) throw new AppError('Conversation not found', 404);

      return this.#messageRepository.findPage({
        conversationId,
        after: afterMessageNumber,
        limit: 100,
      });
    });
  }

  // ─── Participant Validation ────────────────────────────────────────────────

  /**
   * Validate that a user is a participant in a conversation.
   * Used by socket handlers before any operation. DB-based — authoritative.
   * @param {{ conversationId: IDType, userId: IDType }} params
   * @returns {Promise<import('@prisma/client').ConversationParticipant>}
   * @throws {AppError} 403 if not a participant
   */
  async validateParticipant({ conversationId, userId }) {
    return tryCatch(async () => {
      const participant = await this.#conversationRepository.findParticipant({ conversationId, userId });
      if (!participant) throw new AppError('Not a participant in this conversation', 403);
      return participant;
    });
  }

  // ─── Delivery tracking ─────────────────────────────────────────────────────

  /**
   * Mark messages as delivered for a recipient up to a given messageNumber.
   * Uses GREATEST semantics to never decrement.
   * @param {{ conversationId: IDType, userId: IDType, messageNumber: number }} params
   * @returns {Promise<import('@prisma/client').ConversationParticipant>}
   */
  async markAsDelivered({ conversationId, userId, messageNumber }) {
    return tryCatch(async () => {
      return this.#conversationRepository.updateLastReceived({
        conversationId,
        userId,
        messageNumber,
      });
    });
  }

  // ─── Presence helpers (delegates to ChatPresenceCache) ────────────────────

  /** @returns {ChatPresenceCache} */
  get presence() {
    return this.#presence;
  }
}
