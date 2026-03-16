/**
 * @fileoverview Tests for ChatService
 * @module tests/services/chat
 */

import { jest } from '@jest/globals';

const mockConversation = {
  id: 'conv-1',
  workerId: 'worker-1',
  clientId: 'client-1',
  messageCounter: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  id: 'worker-1',
  firstName: 'Ahmed',
  lastName: 'Mohamed',
  profileImageUrl: null,
  isOnline: true,
};

const mockParticipant = {
  id: 'p1',
  conversationId: 'conv-1',
  userId: 'worker-1',
  role: 'WORKER',
  lastReadMessageNumber: 3,
  lastReceivedMessageNumber: 3,
};

const mockMessage = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'worker-1',
  messageNumber: 6,
  content: 'Hello!',
  type: 'TEXT',
  createdAt: new Date(),
  sender: mockUser,
};

const mockPrisma = {
  $transaction: jest.fn((fn) => fn(jest.fn())),
  conversation: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  message: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockConversationRepo = {
  findByPair: jest.fn(),
  createWithParticipants: jest.fn(),
  incrementMessageCounter: jest.fn(),
  findAllByUserId: jest.fn(),
  findWithParticipant: jest.fn(),
  findParticipant: jest.fn(),
  updateLastRead: jest.fn(),
  updateLastReceived: jest.fn(),
  findFirst: jest.fn(),
};

const mockMessageRepo = {
  insertMessage: jest.fn(),
  findById: jest.fn(),
  findPage: jest.fn(),
  findLatest: jest.fn(),
};

const mockUserRepo = {
  findWorkerProfile: jest.fn(),
  findClientProfile: jest.fn(),
};

const mockPresence = {};

jest.mock('../../src/libs/database.js', () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock('../../src/repositories/database/ConversationRepository.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockConversationRepo),
}));

jest.mock('../../src/repositories/database/MessageRepository.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockMessageRepo),
}));

jest.mock('../../src/repositories/database/UserRepository.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockUserRepo),
}));

jest.mock('../../src/repositories/cache/ChatPresenceCache.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockPresence),
}));

const ChatService = (await import('../../src/services/ChatService.js')).default;

describe('ChatService', () => {
  let service;

  beforeEach(() => {
    service = new ChatService({
      conversationRepository: mockConversationRepo,
      messageRepository: mockMessageRepo,
      userRepository: mockUserRepo,
      presence: mockPresence,
    });

    jest.clearAllMocks();
  });

  describe('getOrCreateConversation', () => {
    test('should throw error when workerId equals clientId', async () => {
      const result = await service.getOrCreateConversation({
        workerId: 'user-1',
        clientId: 'user-1',
      });

      expect(result).rejects.toThrow(
        'A user cannot start a conversation with themselves'
      );
    });

    test('should throw error when worker profile not found', async () => {
      mockUserRepo.findWorkerProfile.mockResolvedValue(null);
      mockUserRepo.findClientProfile.mockResolvedValue({ id: 'client-1' });

      const result = await service.getOrCreateConversation({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(result).rejects.toThrow('Worker profile not found');
    });

    test('should throw error when client profile not found', async () => {
      mockUserRepo.findWorkerProfile.mockResolvedValue({ id: 'worker-1' });
      mockUserRepo.findClientProfile.mockResolvedValue(null);

      const result = await service.getOrCreateConversation({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(result).rejects.toThrow('Client profile not found');
    });

    test('should return existing conversation if found', async () => {
      mockUserRepo.findWorkerProfile.mockResolvedValue({ id: 'worker-1' });
      mockUserRepo.findClientProfile.mockResolvedValue({ id: 'client-1' });
      mockConversationRepo.findByPair.mockResolvedValue(mockConversation);

      const result = await service.getOrCreateConversation({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(
        mockConversationRepo.createWithParticipants
      ).not.toHaveBeenCalled();
      expect(result).toEqual(mockConversation);
    });

    test('should create new conversation when not found', async () => {
      mockUserRepo.findWorkerProfile.mockResolvedValue({ id: 'worker-1' });
      mockUserRepo.findClientProfile.mockResolvedValue({ id: 'client-1' });
      mockConversationRepo.findByPair.mockResolvedValue(null);
      mockConversationRepo.createWithParticipants.mockResolvedValue({
        conversation: mockConversation,
      });

      const result = await service.getOrCreateConversation({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(mockConversationRepo.createWithParticipants).toHaveBeenCalledWith({
        workerId: 'worker-1',
        clientId: 'client-1',
      });
      expect(result).toEqual(mockConversation);
    });
  });

  describe('getConversations', () => {
    test('should return conversations with unread counts and delivery info', async () => {
      const conversationsFromDb = [
        {
          ...mockConversation,
          participants: [
            { ...mockParticipant, user: mockUser },
            {
              ...mockParticipant,
              id: 'p2',
              userId: 'client-1',
              lastReceivedMessageNumber: 4,
              lastReadMessageNumber: 2,
              user: { ...mockUser, id: 'client-1' },
            },
          ],
          messages: [mockMessage],
        },
      ];
      mockConversationRepo.findAllByUserId.mockResolvedValue(
        conversationsFromDb
      );

      const result = await service.getConversations({ userId: 'worker-1' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('conv-1');
      expect(result[0].unreadCount).toBe(2);
      expect(result[0].partner).toBeDefined();
      expect(result[0].lastMessage).toEqual(mockMessage);
      expect(result[0].partnerLastReceivedMessageNumber).toBe(4);
      expect(result[0].partnerLastReadMessageNumber).toBe(2);
    });

    test('should handle conversations with no messages', async () => {
      const conversationsFromDb = [
        {
          ...mockConversation,
          messageCounter: 0,
          participants: [
            { ...mockParticipant, lastReadMessageNumber: 0, user: mockUser },
            {
              ...mockParticipant,
              id: 'p2',
              userId: 'client-1',
              lastReadMessageNumber: 0,
              user: { ...mockUser, id: 'client-1' },
            },
          ],
          messages: [],
        },
      ];
      mockConversationRepo.findAllByUserId.mockResolvedValue(
        conversationsFromDb
      );

      const result = await service.getConversations({ userId: 'worker-1' });

      expect(result[0].unreadCount).toBe(0);
      expect(result[0].lastMessage).toBeNull();
    });

    test('should return empty array when no conversations', async () => {
      mockConversationRepo.findAllByUserId.mockResolvedValue([]);

      const result = await service.getConversations({ userId: 'worker-1' });

      expect(result).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    test('should throw error for empty content', async () => {
      const result = await service.sendMessage({
        conversationId: 'conv-1',
        senderId: 'worker-1',
        content: '   ',
      });

      expect(result).rejects.toThrow('Message content cannot be empty');
    });

    test('should create message within transaction', async () => {
      const { default: prisma } = await import('../../src/libs/database.js');
      prisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          conversation: {
            update: jest.fn().mockResolvedValue({ messageCounter: 6 }),
          },
          message: { create: jest.fn().mockResolvedValue(mockMessage) },
        };
        return fn(tx);
      });

      const result = await service.sendMessage({
        conversationId: 'conv-1',
        senderId: 'worker-1',
        content: 'Hello!',
      });

      expect(result).toEqual(mockMessage);
    });
  });

  describe('markAsRead', () => {
    test('should throw error when message not found', async () => {
      mockMessageRepo.findById.mockResolvedValue(null);

      const result = await service.markAsRead({
        conversationId: 'conv-1',
        userId: 'worker-1',
        lastMessageId: 'unknown',
      });

      expect(result).rejects.toThrow('Message not found');
    });

    test('should throw error when message belongs to different conversation', async () => {
      mockMessageRepo.findById.mockResolvedValue({
        ...mockMessage,
        conversationId: 'other-conv',
      });

      const result = await service.markAsRead({
        conversationId: 'conv-1',
        userId: 'worker-1',
        lastMessageId: 'msg-1',
      });

      expect(result).rejects.toThrow(
        'Message does not belong to this conversation'
      );
    });

    test('should update lastReadMessageNumber', async () => {
      mockMessageRepo.findById.mockResolvedValue(mockMessage);
      mockConversationRepo.updateLastRead.mockResolvedValue(mockParticipant);

      const result = await service.markAsRead({
        conversationId: 'conv-1',
        userId: 'worker-1',
        lastMessageId: 'msg-1',
      });

      expect(mockConversationRepo.updateLastRead).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'worker-1',
        messageNumber: 6,
      });
      expect(result.readUpTo).toBe(6);
    });
  });

  describe('markAllAsRead', () => {
    test('should throw error when conversation not found', async () => {
      mockConversationRepo.findFirst.mockResolvedValue(null);

      const result = await service.markAllAsRead({
        conversationId: 'conv-1',
        userId: 'worker-1',
      });

      expect(result).rejects.toThrow('Conversation not found');
    });

    test('should update lastReadMessageNumber and lastReceivedMessageNumber to current counter', async () => {
      mockConversationRepo.findFirst.mockResolvedValue(mockConversation);
      mockConversationRepo.updateLastRead.mockResolvedValue(mockParticipant);
      mockConversationRepo.updateLastReceived.mockResolvedValue(mockParticipant);

      await service.markAllAsRead({
        conversationId: 'conv-1',
        userId: 'worker-1',
      });

      expect(mockConversationRepo.updateLastRead).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'worker-1',
        messageNumber: 5,
      });
      expect(mockConversationRepo.updateLastReceived).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'worker-1',
        messageNumber: 5,
      });
    });
  });

  describe('getMessages', () => {
    test('should throw error when user is not a participant', async () => {
      mockConversationRepo.findParticipant.mockResolvedValue(null);

      const result = await service.getMessages({
        conversationId: 'conv-1',
        userId: 'unknown',
      });

      expect(result).rejects.toThrow('Conversation not found');
    });

    test('should return paginated messages', async () => {
      mockConversationRepo.findParticipant.mockResolvedValue(mockParticipant);
      mockMessageRepo.findPage.mockResolvedValue([mockMessage]);

      const result = await service.getMessages({
        conversationId: 'conv-1',
        userId: 'worker-1',
        after: 0,
        limit: 30,
      });

      expect(mockMessageRepo.findPage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        after: 0,
        limit: 30,
      });
      expect(result).toEqual([mockMessage]);
    });
  });

  describe('getMissedMessages', () => {
    test('should throw error when user is not a participant', async () => {
      mockConversationRepo.findParticipant.mockResolvedValue(null);

      const result = await service.getMissedMessages({
        conversationId: 'conv-1',
        userId: 'unknown',
        afterMessageNumber: 5,
      });

      expect(result).rejects.toThrow('Conversation not found');
    });

    test('should return missed messages', async () => {
      mockConversationRepo.findParticipant.mockResolvedValue(mockParticipant);
      mockMessageRepo.findPage.mockResolvedValue([mockMessage]);

      const result = await service.getMissedMessages({
        conversationId: 'conv-1',
        userId: 'worker-1',
        afterMessageNumber: 5,
      });

      expect(mockMessageRepo.findPage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        after: 5,
        limit: 100,
      });
      expect(result).toEqual([mockMessage]);
    });
  });

  describe('validateParticipant', () => {
    test('should throw error when user is not a participant', async () => {
      mockConversationRepo.findParticipant.mockResolvedValue(null);

      const result = await service.validateParticipant({
        conversationId: 'conv-1',
        userId: 'unknown',
      });

      expect(result).rejects.toThrow('Not a participant in this conversation');
    });

    test('should return participant when valid', async () => {
      mockConversationRepo.findParticipant.mockResolvedValue(mockParticipant);

      const result = await service.validateParticipant({
        conversationId: 'conv-1',
        userId: 'worker-1',
      });

      expect(result).toEqual(mockParticipant);
    });
  });

  describe('markAsDelivered', () => {
    test('should update lastReceivedMessageNumber via repository', async () => {
      mockConversationRepo.updateLastReceived.mockResolvedValue(mockParticipant);

      const result = await service.markAsDelivered({
        conversationId: 'conv-1',
        userId: 'worker-1',
        messageNumber: 10,
      });

      expect(mockConversationRepo.updateLastReceived).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'worker-1',
        messageNumber: 10,
      });
      expect(result).toEqual(mockParticipant);
    });
  });
});
