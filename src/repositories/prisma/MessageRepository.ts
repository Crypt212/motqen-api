import IMessageRepository from '../interfaces/MessageRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { isEmptyFilter, getEmptyPaginatedResult } from './utils.js';
import {
  Message,
  MessageCreateInput,
  MessageFilter,
  MessageType,
} from '../../domain/message.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { IDType } from '../interfaces/Repository.js';
import { User } from '../../domain/user.entity.js';
import { PrismaClient } from 'src/generated/prisma/client.js';

export default class MessageRepository extends Repository implements IMessageRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: Message): Message {
    return {
      id: record.id,
      conversationId: record.conversationId,
      senderId: record.senderId,
      messageNumber: record.messageNumber,
      content: record.content,
      type: record.type,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainWithSender(record: Message & { sender?: Partial<User> }): Message {
    return {
      id: record.id,
      conversationId: record.conversationId,
      senderId: record.senderId,
      messageNumber: record.messageNumber,
      content: record.content,
      type: record.type,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      sender: record.sender
        ? {
            id: record.sender.id,
            firstName: record.sender.firstName,
            lastName: record.sender.lastName,
            profileImageUrl: record.sender.profileImageUrl,
          }
        : undefined,
    };
  }

  async exists(params: { filter: MessageFilter }): Promise<boolean> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return false;

      const count = await this.prismaClient.message.count({
        where: filter,
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'exists');
    }
  }

  async find(params: { filter: MessageFilter }): Promise<Message | null> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return null;

      const record = await this.prismaClient.message.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findMany(params: {
    filter?: MessageFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Message>;
  }): Promise<PaginatedResultMeta & { messages: Message[] }> {
    try {
      const { filter, pagination, sort } = params;
      if (!filter || isEmptyFilter(filter)) return { ...getEmptyPaginatedResult(), messages: [] };

      const total = await this.prismaClient.message.count({
        where: filter,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const messages = await this.prismaClient.message.findMany({
        where: filter,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        messages: messages.map((m) => this.toDomain(m)),
        ...paginationResult,
        count: messages.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }

  async findById(params: { messageId: string }): Promise<Message | null> {
    try {
      const record = await this.prismaClient.message.findUnique({
        where: { id: params.messageId },
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findById');
    }
  }

  async findPage(params: {
    conversationId: string;
    after?: number;
    limit?: number;
  }): Promise<Message[]> {
    try {
      const messages = await this.prismaClient.message.findMany({
        where: {
          conversationId: params.conversationId,
          messageNumber: { gt: params.after || 0 },
        },
        orderBy: { messageNumber: 'asc' },
        take: params.limit || 30,
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
      return messages.map((m) => this.toDomainWithSender(m));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findPage');
    }
  }

  async findLatest(params: { conversationId: string; limit?: number }): Promise<Message[]> {
    try {
      const rows = await this.prismaClient.message.findMany({
        where: { conversationId: params.conversationId },
        orderBy: { messageNumber: 'desc' },
        take: params.limit || 30,
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
      return rows.reverse().map((m) => this.toDomainWithSender(m));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findLatest');
    }
  }

  async create(params: { message: MessageCreateInput }): Promise<Message> {
    try {
      const record = await this.prismaClient.message.create({
        data: {
          conversationId: params.message.conversationId,
          senderId: params.message.senderId,
          messageNumber: params.message.messageNumber,
          content: params.message.content,
          type: params.message.type || 'TEXT',
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async createMany(params: { messages: MessageCreateInput[] }): Promise<Message[]> {
    try {
      const records = await this.prismaClient.message.createManyAndReturn({
        data: params.messages.map((m) => ({
          conversationId: m.conversationId,
          senderId: m.senderId,
          messageNumber: m.messageNumber,
          content: m.content,
          type: m.type || 'TEXT',
        })),
      });
      return records.map((r) => this.toDomain(r));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'createMany');
    }
  }

  async insertMessage(params: {
    conversationId: IDType;
    senderId: IDType;
    messageNumber: number;
    content: string;
    type?: MessageType;
  }): Promise<Message> {
    try {
      const record = await this.prismaClient.message.create({
        data: {
          conversationId: params.conversationId,
          senderId: params.senderId,
          messageNumber: params.messageNumber,
          content: params.content,
          type: params.type || 'TEXT',
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'insertMessage');
    }
  }

  async updateMany(params: {
    filter: MessageFilter;
    message: Partial<Message>;
  }): Promise<Message[]> {
    try {
      const { filter, message } = params;
      if (isEmptyFilter(filter)) return [];

      const records = await this.prismaClient.message.findMany({
        where: filter,
      });

      if (records.length === 0) return [];

      await this.prismaClient.message.updateMany({
        where: filter,
        data: message,
      });

      const updatedRecords = await this.prismaClient.message.findMany({
        where: filter,
      });

      return updatedRecords.map((r) => this.toDomain(r));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateMany');
    }
  }

  async deleteMany(params: { filter: MessageFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      await this.prismaClient.message.deleteMany({
        where: filter,
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteMany');
    }
  }
}
