/**
 * @fileoverview Tests for ConversationRepository
 * @module tests/repositories/conversation
 */

import { jest } from '@jest/globals';
import { prismaMock as prisma } from "../setup-db.js";

const mockConversation = {
  id: 'conv-1',
  workerId: 'worker-1',
  clientId: 'client-1',
  messageCounter: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockParticipants = [
  {
    id: 'p1',
    conversationId: 'conv-1',
    userId: 'worker-1',
    role: 'WORKER',
    lastReadMessageNumber: 3,
  },
  {
    id: 'p2',
    conversationId: 'conv-1',
    userId: 'client-1',
    role: 'CLIENT',
    lastReadMessageNumber: 5,
  },
];

const mockUser = {
  id: 'worker-1',
  firstName: 'Ahmed',
  lastName: 'Mohamed',
  profileImageUrl: null,
  lastSeenAt: new Date(),
};

import ConversationRepository from '../../src/repositories/database/ConversationRepository.js';

describe('ConversationRepository', () => {
  let repository;

  beforeEach(async () => {
    repository = new ConversationRepository(prisma);
    jest.clearAllMocks();
  });

  describe('findByPair', () => {
    test('should find conversation by worker and client IDs', async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);

      const result = await repository.findByPair({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
        where: {
          workerId_clientId: { workerId: 'worker-1', clientId: 'client-1' },
        },
      });
      expect(result).toEqual(mockConversation);
    });

    test('should return null when no conversation exists', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      const result = await repository.findByPair({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(result).toBeNull();
    });
  });

  describe('createWithParticipants', () => {
    test('should create conversation with both participants', async () => {
      const conversationWithParticipants = {
        ...mockConversation,
        participants: mockParticipants,
      };
      prisma.conversation.create.mockResolvedValue(
        conversationWithParticipants
      );

      const result = await repository.createWithParticipants({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          workerId: 'worker-1',
          clientId: 'client-1',
          participants: {
            createMany: {
              data: [
                { userId: 'worker-1', role: 'WORKER' },
                { userId: 'client-1', role: 'CLIENT' },
              ],
            },
          },
        },
        include: { participants: true },
      });
      expect(result.conversation).toEqual(mockConversation);
      expect(result.participants).toEqual(mockParticipants);
    });
  });

  describe('incrementMessageCounter', () => {
    test('should increment and return new message counter', async () => {
      prisma.conversation.update.mockResolvedValue({ messageCounter: 6 });

      const result = await repository.incrementMessageCounter({
        conversationId: 'conv-1',
      });

      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
        data: { messageCounter: { increment: 1 } },
        select: { messageCounter: true },
      });
      expect(result).toBe(6);
    });
  });

  describe('findAllByUserId', () => {
    test('should return all conversations for a user', async () => {
      const conversationsWithData = [
        {
          ...mockConversation,
          participants: [
            { ...mockParticipants[0], user: mockUser },
            { ...mockParticipants[1], user: { ...mockUser, id: 'client-1' } },
          ],
          messages: [{ id: 'msg-1', content: 'Hello' }],
        },
      ];
      prisma.conversation.findMany.mockResolvedValue(conversationsWithData);

      const result = await repository.findAllByUserId({ userId: 'worker-1' });

      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        where: { participants: { some: { userId: 'worker-1' } } },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImageUrl: true,
                  lastSeenAt: true,
                },
              },
            },
          },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(conversationsWithData);
    });

    test('should return empty array when no conversations exist', async () => {
      prisma.conversation.findMany.mockResolvedValue([]);

      const result = await repository.findAllByUserId({ userId: 'worker-1' });

      expect(result).toEqual([]);
    });
  });

  describe('findWithParticipant', () => {
    test('should find conversation with participant verification', async () => {
      const conversationWithParticipants = {
        ...mockConversation,
        participants: mockParticipants,
      };
      prisma.conversation.findFirst.mockResolvedValue(
        conversationWithParticipants
      );

      const result = await repository.findWithParticipant({
        conversationId: 'conv-1',
        userId: 'worker-1',
      });

      expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
        where: { id: 'conv-1', participants: { some: { userId: 'worker-1' } } },
        include: { participants: true },
      });
      expect(result).toEqual(conversationWithParticipants);
    });

    test('should return null when user is not a participant', async () => {
      prisma.conversation.findFirst.mockResolvedValue(null);

      const result = await repository.findWithParticipant({
        conversationId: 'conv-1',
        userId: 'other-user',
      });

      expect(result).toBeNull();
    });
  });

  describe('findParticipant', () => {
    test('should find a single participant', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue(
        mockParticipants[0]
      );

      const result = await repository.findParticipant({
        conversationId: 'conv-1',
        userId: 'worker-1',
      });

      expect(prisma.conversationParticipant.findUnique).toHaveBeenCalledWith({
        where: {
          conversationId_userId: {
            conversationId: 'conv-1',
            userId: 'worker-1',
          },
        },
      });
      expect(result).toEqual(mockParticipants[0]);
    });

    test('should return null when participant not found', async () => {
      prisma.conversationParticipant.findUnique.mockResolvedValue(null);

      const result = await repository.findParticipant({
        conversationId: 'conv-1',
        userId: 'unknown',
      });

      expect(result).toBeNull();
    });
  });

  describe('updateLastRead', () => {
    test('should update lastReadMessageNumber using raw query', async () => {
      prisma.$queryRaw.mockResolvedValue([mockParticipants[0]]);

      const result = await repository.updateLastRead({
        conversationId: 'conv-1',
        userId: 'worker-1',
        messageNumber: 10,
      });

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual(mockParticipants[0]);
    });
  });
});
