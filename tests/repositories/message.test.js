/**
 * @fileoverview Tests for MessageRepository
 * @module tests/repositories/message
 */

import { jest } from '@jest/globals';
import { prismaMock } from '../setup-db.js';
import MessageRepository from '../../src/repositories/database/MessageRepository.js';

const mockMessage = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'worker-1',
  messageNumber: 1,
  content: 'Hello there!',
  type: 'TEXT',
  createdAt: new Date(),
  sender: {
    id: 'worker-1',
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    profileImageUrl: null,
  },
};

const prisma = prismaMock;

describe('MessageRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new MessageRepository(prisma);
    jest.clearAllMocks();
  });

  describe('insertMessage', () => {
    test('should insert a new message with correct data', async () => {
      prisma.message.create.mockResolvedValue(mockMessage);

      const result = await repository.insertMessage({
        conversationId: 'conv-1',
        senderId: 'worker-1',
        messageNumber: 1,
        content: 'Hello there!',
        type: 'TEXT',
      });

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversationId: 'conv-1',
          senderId: 'worker-1',
          messageNumber: 1,
          content: 'Hello there!',
          type: 'TEXT',
        },
      });
      expect(result).toEqual(mockMessage);
    });

    test('should use default type when not provided', async () => {
      prisma.message.create.mockResolvedValue(mockMessage);

      await repository.insertMessage({
        conversationId: 'conv-1',
        senderId: 'worker-1',
        messageNumber: 1,
        content: 'Hello there!',
      });

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversationId: 'conv-1',
          senderId: 'worker-1',
          messageNumber: 1,
          content: 'Hello there!',
          type: 'TEXT',
        },
      });
    });
  });

  describe('findById', () => {
    test('should find message by ID', async () => {
      prisma.message.findUnique.mockResolvedValue(mockMessage);

      const result = await repository.findById({ messageId: 'msg-1' });

      expect(prisma.message.findUnique).toHaveBeenCalledWith({
        where: { id: 'msg-1' },
      });
      expect(result).toEqual(mockMessage);
    });

    test('should return null when message not found', async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      const result = await repository.findById({ messageId: 'unknown' });

      expect(result).toBeNull();
    });
  });

  describe('findPage', () => {
    test('should return paginated messages in ascending order', async () => {
      const messages = [
        { ...mockMessage, messageNumber: 2 },
        { ...mockMessage, id: 'msg-2', messageNumber: 3 },
      ];
      prisma.message.findMany.mockResolvedValue(messages);

      const result = await repository.findPage({
        conversationId: 'conv-1',
        after: 1,
        limit: 30,
      });

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv-1',
          messageNumber: { gt: 1 },
        },
        orderBy: { messageNumber: 'asc' },
        take: 30,
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
      expect(result).toEqual(messages);
    });

    test('should use default values for after and limit', async () => {
      prisma.message.findMany.mockResolvedValue([]);

      await repository.findPage({ conversationId: 'conv-1' });

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          conversationId: 'conv-1',
          messageNumber: { gt: 0 },
        },
        orderBy: { messageNumber: 'asc' },
        take: 30,
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
    });

    test('should respect custom limit', async () => {
      prisma.message.findMany.mockResolvedValue([]);

      await repository.findPage({ conversationId: 'conv-1', limit: 10 });

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });

    test('should return empty array when no messages exist', async () => {
      prisma.message.findMany.mockResolvedValue([]);

      const result = await repository.findPage({ conversationId: 'conv-1' });

      expect(result).toEqual([]);
    });
  });

  describe('findLatest', () => {
    test('should return latest messages in ascending order', async () => {
      const messagesDesc = [
        { ...mockMessage, messageNumber: 3 },
        { ...mockMessage, id: 'msg-2', messageNumber: 2 },
      ];
      prisma.message.findMany.mockResolvedValue(messagesDesc);

      const result = await repository.findLatest({ conversationId: 'conv-1' });

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { conversationId: 'conv-1' },
        orderBy: { messageNumber: 'desc' },
        take: 30,
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
      expect(result).toEqual(messagesDesc.reverse());
    });

    test('should respect custom limit', async () => {
      prisma.message.findMany.mockResolvedValue([]);

      await repository.findLatest({ conversationId: 'conv-1', limit: 10 });

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });

    test('should return empty array when no messages exist', async () => {
      prisma.message.findMany.mockResolvedValue([]);

      const result = await repository.findLatest({ conversationId: 'conv-1' });

      expect(result).toEqual([]);
    });
  });
});
