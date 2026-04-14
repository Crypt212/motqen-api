import IConversationRepository from '../interfaces/ConversationRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  Conversation,
  ConversationCreateInput,
  ConversationFilter,
  ConversationParticipant,
  ConversationUpdateInput,
  ConversationWithParticipantsAndMessages,
} from '../../domain/conversation.entity.js';
import { isEmptyFilter, getEmptyPaginatedResult } from './utils.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { PrismaClient } from '../../generated/prisma/client.js';

export default class ConversationRepository extends Repository implements IConversationRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: Conversation): Conversation {
    return {
      id: record.id,
      messageCounter: record.messageCounter,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainParticipant(record: ConversationParticipant): ConversationParticipant {
    return {
      id: record.id,
      conversationId: record.conversationId,
      userId: record.userId,
      role: record.role,
      lastReadMessageNumber: record.lastReadMessageNumber,
      lastReceivedMessageNumber: record.lastReceivedMessageNumber,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async exists(params: { filter: ConversationFilter }): Promise<boolean> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return false;

      const count = await this.prismaClient.conversation.count({
        where: filter,
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'exists');
    }
  }

  async find(params: { filter: ConversationFilter }): Promise<Conversation | null> {
    try {
      const { filter } = params;

      const record = await this.prismaClient.conversation.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findById(params: { id: IDType }): Promise<Conversation | null> {
    try {
      const record = await this.prismaClient.conversation.findUnique({
        where: { id: params.id },
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findById');
    }
  }

  async findByPair(params: { workerId: IDType; clientId: IDType }): Promise<Conversation | null> {
    try {
      return await this.prismaClient.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: { userId: params.workerId, role: 'WORKER' },
              },
            },
            {
              participants: {
                some: { userId: params.clientId, role: 'CLIENT' },
              },
            },
          ],
        },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findByPair');
    }
  }

  async findWithParticipant(params: {
    conversationId: IDType;
    userId: IDType;
  }): Promise<ConversationWithParticipantsAndMessages | null> {
    try {
      const record = await this.prismaClient.conversation.findFirst({
        where: {
          id: params.conversationId,
          participants: { some: { userId: params.userId } },
        },
        include: { participants: true },
      });
      if (!record) return null;

      return {
        ...this.toDomain(record),
        participants: record.participants.map((p) => this.toDomainParticipant(p)),
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findWithParticipant');
    }
  }

  async findNonEmptyConversationsWithParticipantsAndMessages(params: {
    filter: ConversationFilter;
    userId: IDType;
    pagination?: PaginationOptions;
    sort?: SortOptions<ConversationWithParticipantsAndMessages>;
  }): Promise<
    PaginatedResultMeta & {
      conversationParticipantsWithMessages: ConversationWithParticipantsAndMessages[];
    }
  > {
    try {
      const { filter, userId, pagination, sort } = params;

      const total = await this.prismaClient.conversation.count({
        where: { ...filter, participants: { some: { userId } }, messageCounter: { gt: 0 } },
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const conversations = await this.prismaClient.conversation.findMany({
        where: {
          participants: { some: { userId } },
          messageCounter: { gt: 0 },
          ...filter,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  role: true,
                  status: true,
                  phoneNumber: true,
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
        orderBy: sortQuery || { updatedAt: 'desc' },
        ...paginationQuery,
      });

      return {
        conversationParticipantsWithMessages: conversations.map((c) => ({
          ...this.toDomain(c),
          LastMessage: c.messages && c.messages.length > 0 ? { content: c.messages[0].content ,type: c.messages[0].type} : undefined,
          participants: c.participants.map((p) => ({
            ...p,
            user: p.user
              ? {
                  id: p.user.id,
                  firstName: p.user.firstName,
                  middleName: p.user.middleName,
                  lastName: p.user.lastName,
                  status: p.user.status,
                  role: p.user.role,
                  phoneNumber: p.user.phoneNumber,
                  profileImageUrl: p.user.profileImageUrl,
                  isOnline: p.user.isOnline,
                }
              : undefined,
          })),
        })),
        ...paginationResult,
        count: conversations.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findNonEmptyConversations');
    }
  }

  async findMany(params: {
    filter: ConversationFilter;
    userId: IDType;
    pagination?: PaginationOptions;
    sort?: SortOptions<ConversationWithParticipantsAndMessages>;
  }): Promise<
    PaginatedResultMeta & {
      conversationParticipantsWithMessages: ConversationWithParticipantsAndMessages[];
    }
  > {
    try {
      const { filter, userId, pagination, sort } = params;

      const total = await this.prismaClient.conversation.count({
        where: { ...filter, participants: { some: { userId } } },
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const conversations = await this.prismaClient.conversation.findMany({
        where: {
          participants: { some: { userId } },
          ...filter,
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  role: true,
                  status: true,
                  phoneNumber: true,
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
        orderBy: sortQuery || { updatedAt: 'desc' },
        ...paginationQuery,
      });

      return {
        conversationParticipantsWithMessages: conversations.map((c) => ({
          ...this.toDomain(c),
          participants: c.participants.map((p) => ({
            ...this.toDomainParticipant(p),
            user: p.user
              ? {
                  id: p.user.id,
                  firstName: p.user.firstName,
                  lastName: p.user.lastName,
                  middleName: p.user.middleName,
                  role: p.user.role,
                  status: p.user.status,
                  phoneNumber: p.user.phoneNumber,
                  profileImageUrl: p.user.profileImageUrl,
                  isOnline: p.user.isOnline,
                }
              : undefined,
          })),
        })),
        ...paginationResult,
        count: conversations.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }

  async findParticipant(params: {
    conversationId: IDType;
    userId: IDType;
  }): Promise<ConversationParticipant | null> {
    try {
      const participant = await this.prismaClient.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: params.conversationId,
            userId: params.userId,
          },
        },
      });
      return participant ? this.toDomainParticipant(participant) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findParticipant');
    }
  }

  async create(params: { conversation: ConversationCreateInput }): Promise<Conversation> {
    try {
      const record = await this.prismaClient.conversation.create({
        data: {
          participants: {
            create: [
              { userId: params.conversation.workerId, role: 'WORKER' },
              { userId: params.conversation.clientId, role: 'CLIENT' },
            ],
          },
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async createWithParticipants(params: { workerId: IDType; clientId: IDType }): Promise<{
    conversation: Conversation;
    participants: ConversationParticipant[];
  }> {
    try {
      const conversation = await this.prismaClient.conversation.create({
        data: {
          participants: {
            create: [
              { userId: params.workerId, role: 'WORKER' },
              { userId: params.clientId, role: 'CLIENT' },
            ],
          },
        },
        include: { participants: true },
      });

      return {
        conversation: this.toDomain(conversation),
        participants: conversation.participants.map((p) => this.toDomainParticipant(p)),
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'createWithParticipants');
    }
  }

  async update(params: {
    filter: ConversationFilter;
    conversation: ConversationUpdateInput;
  }): Promise<Conversation> {
    try {
      const { filter, conversation } = params;
      if (isEmptyFilter(filter)) {
        throw new Error('Conversation not found');
      }

      const existing = await this.prismaClient.conversation.findFirst({
        where: filter,
      });

      if (!existing) {
        throw new Error('Conversation not found');
      }

      const updated = await this.prismaClient.conversation.update({
        where: { id: existing.id },
        data: conversation,
      });
      return this.toDomain(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async updateMany(params: {
    filter: ConversationFilter;
    conversation: ConversationUpdateInput;
  }): Promise<unknown> {
    try {
      const { filter, conversation } = params;
      if (isEmptyFilter(filter)) return { count: 0 };

      return await this.prismaClient.conversation.updateMany({
        where: filter,
        data: conversation,
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateMany');
    }
  }

  async incrementMessageCounter(params: { conversationId: IDType }): Promise<number> {
    try {
      const updated = await this.prismaClient.conversation.update({
        where: { id: params.conversationId },
        data: { messageCounter: { increment: 1 } },
        select: { messageCounter: true },
      });
      return updated.messageCounter;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'incrementMessageCounter');
    }
  }

  async delete(params: { filter: ConversationFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      const existing = await this.prismaClient.conversation.findFirst({
        where: filter,
      });

      if (!existing) return;

      await this.prismaClient.conversation.delete({
        where: { id: existing.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }

  async deleteMany(params: { filter: ConversationFilter }): Promise<unknown> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return { count: 0 };

      return await this.prismaClient.conversation.deleteMany({
        where: filter,
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteMany');
    }
  }

  async updateLastRead(params: {
    conversationId: IDType;
    userId: IDType;
    messageNumber: number;
  }): Promise<ConversationParticipant> {
    try {
      const rows = await this.prismaClient.$queryRaw`
        UPDATE conversation_participants
        SET "lastReadMessageNumber" = GREATEST("lastReadMessageNumber", ${params.messageNumber})
        WHERE "conversationId" = ${params.conversationId} AND "userId" = ${params.userId}
        RETURNING *
      `;
      if (!(typeof rows === 'object' && Array.isArray(rows)) || rows.length === 0) {
        throw new Error(
          `Participant not found: conversationId=${params.conversationId}, userId=${params.userId}`
        );
      }
      return this.toDomainParticipant(rows[0] as ConversationParticipant);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateLastRead');
    }
  }

  async updateLastReceived(params: {
    conversationId: IDType;
    userId: IDType;
    messageNumber: number;
  }): Promise<ConversationParticipant> {
    try {
      const rows = await this.prismaClient.$queryRaw`
        UPDATE conversation_participants
        SET "lastReceivedMessageNumber" = GREATEST("lastReceivedMessageNumber", ${params.messageNumber})
        WHERE "conversationId" = ${params.conversationId} AND "userId" = ${params.userId}
        RETURNING *
      `;
      if (!(typeof rows === 'object' && Array.isArray(rows)) || rows.length === 0) {
        throw new Error(
          `Participant not found: conversationId=${params.conversationId}, userId=${params.userId}`
        );
      }
      return this.toDomainParticipant(rows[0] as ConversationParticipant);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateLastReceived');
    }
  }
}
