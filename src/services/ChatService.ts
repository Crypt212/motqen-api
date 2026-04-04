/**
 * @fileoverview ChatService - Business logic for real-time chat
 * @module services/ChatService
 */

import AppError from '../errors/AppError.js';
import uploadToCloudinary, { deleteFromCloudinary } from '../providers/cloudinaryProvider.js';
import Service, { tryCatch } from './Service.js';
import IChatPresenceCache from '../cache/interfaces/ChatPresenceCache.js';
import { Message, MessageType } from '../domain/message.entity.js';
import { User } from '../domain/user.entity.js';
import IClientProfileRepository from '../repositories/interfaces/ClientRepository.js';
import IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import IMessageRepository from '../repositories/interfaces/MessageRepository.js';
import IConversationRepository from '../repositories/interfaces/ConversationRepository.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import {
  Conversation,
  ConversationParticipant,
  ConversationWithParticipantsAndMessages,
} from '../domain/conversation.entity.js';
import RepositoryError, { RepositoryErrorType } from '../errors/RepositoryError.js';
import prisma from '../libs/database.js';
import { $Enums } from '../generated/prisma/client.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../types/query.js';

export type ConversationWithMeta = {
  id: string;
  messageCounter: number;
  unreadCount: number;
  lastMessage?: Message;
  partner?: User;
  partnerLastReceivedMessageNumber: number;
  partnerLastReadMessageNumber: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * ChatService — all chat business logic (conversation creation, messaging, read state)
 * @class
 * @extends Service
 */
export default class ChatService extends Service {
  private conversationRepository: IConversationRepository;
  private messageRepository: IMessageRepository;
  private workerProfileRepository: IWorkerProfileRepository;
  private _presence: IChatPresenceCache;

  constructor(params: {
    conversationRepository: IConversationRepository;
    messageRepository: IMessageRepository;
    clientProfileRepository: IClientProfileRepository;
    workerProfileRepository: IWorkerProfileRepository;
    presence: IChatPresenceCache;
  }) {
    super();
    this.conversationRepository = params.conversationRepository;
    this.messageRepository = params.messageRepository;
    this.workerProfileRepository = params.workerProfileRepository;
    this._presence = params.presence;
  }

  // ─── Conversation ──────────────────────────────────────────────────────────

  /**
   * Get or create the conversation between a Worker and a Client.
   * Validates that workerId has a workerProfile and clientId has a clientProfile.
   * Returns the existing conversation if the pair already has one (idempotent).
   * @throws {AppError} 400 if profiles are missing or same user is both roles
   * @throws {RepositoryError} 409 if DB race creates duplicate (caught from UNIQUE constraint)
   */
  async getOrCreateConversation(params: {
    workerId: IDType;
    clientId: IDType;
  }): Promise<Conversation> {
    const { workerId, clientId } = params;
    if (workerId === clientId)
      throw new AppError('A user cannot start a conversation with themselves', 400);

    // Validate roles at the profile level
    const workerProfile = await this.workerProfileRepository.find({
      workerFilter: { userId: workerId },
    });

    if (!workerProfile) throw new AppError('Worker profile not found', 400);

    const existing = await this.conversationRepository.findByPair({
      workerId,
      clientId,
    });
    if (existing) return existing;

    try {
      const { conversation } = await this.conversationRepository.createWithParticipants({
        workerId,
        clientId,
      });
      return conversation;
    } catch (error) {
      // P2002 = UNIQUE constraint violation — race condition, another request
      // already created this conversation. Return the existing one.
      if (error instanceof RepositoryError && error.code === RepositoryErrorType.DUPLICATE_KEY) {
        const existingAfterRace = await this.conversationRepository.findByPair({
          workerId,
          clientId,
        });
        if (existingAfterRace) return existingAfterRace;
      }
      throw error;
    }
  }

  /**
   * List all conversations for a user with derived unreadCount.
   */
  async getConversations(params: {
    userId: IDType;
    pagination: PaginationOptions;
    sort: SortOptions<ConversationWithParticipantsAndMessages>;
  }): Promise<
    PaginatedResultMeta & {
      conversations: ConversationWithParticipantsAndMessages[];
    }
  > {
    const { userId, pagination, sort } = params;
    return tryCatch(async () => {
      const convs =
        await this.conversationRepository.findNonEmptyConversationsWithParticipantsAndMessages({
          userId,
          filter: {},
          pagination,
          sort,
        });

      const conversations = convs.conversationParticipantsWithMessages.map((conv) => {
        const [myParticipant, partnerParticipant]: [
          ConversationParticipant,
          ConversationParticipant,
        ] = conv.participants.reduce(
          (acc, p) => {
            if (p.userId === userId) acc[0] = p;
            else acc[1] = p;
            return acc;
          },
          [null, null]
        );
        const unreadCount = Math.max(
          0,
          conv.messageCounter - (myParticipant?.lastReadMessageNumber ?? 0)
        );

        return {
          id: conv.id,
          messageCounter: conv.messageCounter,
          unreadCount,
          lastMessage: conv.messages ? conv.messages : null,
          partner: partnerParticipant?.user ?? null,
          partnerLastReceivedMessageNumber: partnerParticipant?.lastReceivedMessageNumber ?? 0,
          partnerLastReadMessageNumber: partnerParticipant?.lastReadMessageNumber ?? 0,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      });

      return {
        conversations: conversations as unknown as ConversationWithParticipantsAndMessages[],
        page: convs.page,
        limit: convs.limit,
        count: convs.count,
        total: convs.total,
        totalPages: convs.totalPages,
        hasNext: convs.hasNext,
        hasPrev: convs.hasPrev,
      };
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
   */
  async sendMessage(params: {
    conversationId: IDType;
    senderId: IDType;
    content: string;
    type?: MessageType;
  }): Promise<Message> {
    let { conversationId, senderId, content, type } = params;
    return tryCatch(async () => {
      content = content?.trim() || '';
      if (!content) throw new AppError('Message content cannot be empty', 400);
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
          data: {
            conversationId,
            senderId,
            messageNumber,
            content,
            type: $Enums.MessageType[type],
          },
        });
      });

      // Sender always "receives" their own message
      await this.conversationRepository.updateLastReceived({
        conversationId,
        userId: senderId,
        messageNumber: message.messageNumber,
      });

      return message;
    });
  }

  /**
   * Send an image message — uploads to Cloudinary,
   * then atomically increments the counter and inserts the message.
   *
   * @param params.conversationId  The conversation to send the image in
   * @param params.senderId        The authenticated user's ID
   * @param params.imageBuffer     The raw image buffer from multer
   */
  async sendImageMessage(params: {
    conversationId: IDType;
    senderId: IDType;
    imageBuffer: Buffer;
  }): Promise<Message> {
    const { conversationId, senderId, imageBuffer } = params;
    return tryCatch(async () => {
      const { url, publicId } = await uploadToCloudinary(
        imageBuffer,
        `chat-images/${conversationId}`
      );

      try {
        return await this.sendMessage({
          conversationId,
          senderId,
          content: url,
          type: 'IMAGE',
        });
      } catch (error) {
        await deleteFromCloudinary(publicId).catch(() => undefined);
        throw error;
      }
    });
  }

  // ─── Read State ────────────────────────────────────────────────────────────

  /**
   * Mark messages as read up to and including `lastMessageId`.
   * Validates that the message belongs to the conversation (prevents cross-conv attacks).
   * Uses GREATEST so the value never decrements.
   *
   * @throws {AppError} 404 if message not found
   * @throws {AppError} 400 if message belongs to a different conversation
   */
  async markAsRead(params: {
    conversationId: IDType;
    userId: IDType;
    lastMessageId: IDType;
  }): Promise<{ readUpTo: number }> {
    const { conversationId, userId, lastMessageId } = params;
    return tryCatch(async () => {
      const message = await this.messageRepository.findById({
        messageId: lastMessageId,
      });
      if (!message) throw new AppError('Message not found', 404);
      if (message.conversationId !== conversationId)
        throw new AppError('Message does not belong to this conversation', 400);

      const participant = await this.conversationRepository.findParticipant({
        conversationId,
        userId,
      });
      if (!participant) throw new AppError('Not a participant in this conversation', 403);

      if (message.messageNumber <= participant.lastReadMessageNumber) {
        return { readUpTo: message.messageNumber };
      }

      await this.conversationRepository.updateLastRead({
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
   */
  async markAllAsRead(params: { conversationId: IDType; userId: IDType }): Promise<void> {
    const { conversationId, userId } = params;
    return tryCatch(async () => {
      const conv = await this.conversationRepository.find({
        filter: {
          id: conversationId,
        },
      });
      if (!conv) throw new AppError('Conversation not found', 404);

      // Reading implies receiving — bump both counters
      await Promise.all([
        this.conversationRepository.updateLastRead({
          conversationId,
          userId,
          messageNumber: conv.messageCounter,
        }),
        this.conversationRepository.updateLastReceived({
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
   */
  async getMessages(params: {
    conversationId: IDType;
    userId: IDType;
    after: number;
    limit: number;
  }): Promise<Message[]> {
    const { conversationId, userId } = params;
    const after = params.after ?? 0;
    const limit = params.limit ?? 30;
    return tryCatch(async () => {
      // Validate participation (DB truth)
      const participant = await this.conversationRepository.findParticipant({
        conversationId,
        userId,
      });
      if (!participant)
        throw new AppError('Conversation not found or you are not participate', 404);

      return this.messageRepository.findPage({ conversationId, after, limit });
    });
  }

  /**
   * Missed messages since a given messageNumber (for offline catch-up).
   */
  async getMissedMessages(params: {
    conversationId: IDType;
    userId: IDType;
    afterMessageNumber: number;
  }): Promise<Message[]> {
    const { conversationId, userId, afterMessageNumber } = params;
    return tryCatch(async () => {
      const participant = await this.conversationRepository.findParticipant({
        conversationId,
        userId,
      });
      if (!participant) throw new AppError('Conversation not found', 404);

      return this.messageRepository.findPage({
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
   * @throws {AppError} 403 if not a participant
   */
  async validateParticipant(params: {
    conversationId: IDType;
    userId: IDType;
  }): Promise<ConversationParticipant> {
    const { conversationId, userId } = params;
    return tryCatch(async () => {
      const participant = await this.conversationRepository.findParticipant({
        conversationId,
        userId,
      });
      if (!participant) throw new AppError('Not a participant in this conversation', 403);
      return participant;
    });
  }

  // ─── Delivery tracking ─────────────────────────────────────────────────────

  /**
   * Mark messages as delivered for a recipient up to a given messageNumber.
   * Uses GREATEST semantics to never decrement.
   */
  async markAsDelivered(params: {
    conversationId: IDType;
    userId: IDType;
    messageNumber: number;
  }): Promise<ConversationParticipant> {
    const { conversationId, userId, messageNumber } = params;
    return tryCatch(async () => {
      const participant = await this.conversationRepository.findParticipant({
        conversationId,
        userId,
      });
      if (!participant) throw new AppError('Not a participant in this conversation', 403);

      if (messageNumber <= participant.lastReceivedMessageNumber) {
        return participant;
      }

      return this.conversationRepository.updateLastReceived({
        conversationId,
        userId,
        messageNumber,
      });
    });
  }

  // ─── Presence helpers (delegates to ChatPresenceCache) ────────────────────

  get presence(): IChatPresenceCache {
    return this._presence;
  }
}
