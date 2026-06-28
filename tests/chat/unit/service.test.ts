import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatService from '../../../src/services/ChatService';
import AppError from '../../../src/errors/AppError';
import RepositoryError, { RepositoryErrorType } from '../../../src/errors/RepositoryError';

describe('ChatService', () => {
  let conversationRepository: any;
  let messageRepository: any;
  let clientProfileRepository: any;
  let workerProfileRepository: any;
  let presence: any;
  let service: InstanceType<typeof ChatService>;

  beforeEach(() => {
    vi.clearAllMocks();

    conversationRepository = {
      findParticipants: vi.fn(),
      findById: vi.fn(),
      findByPair: vi.fn(),
      find: vi.fn(),
      createWithParticipants: vi.fn(),
      updateLastRead: vi.fn(),
      updateLastReceived: vi.fn(),
    };

    messageRepository = {
      atomicSendMessage: vi.fn(),
      findById: vi.fn(),
    };

    clientProfileRepository = {
      find: vi.fn(),
    };

    workerProfileRepository = {
      find: vi.fn(),
    };

    presence = {
      getChatMembers: vi.fn(),
      addChatMembers: vi.fn(),
      setParticipantCounters: vi.fn(),
      getParticipantCounters: vi.fn(),
    };

    service = new ChatService({
      clientProfileRepository,
      conversationRepository,
      messageRepository,
      presence,
      workerProfileRepository,
    });
  });

  const baseMessage = {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    messageNumber: 1,
    content: 'Hello',
    type: 'TEXT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const baseParticipant = (overrides: any = {}) => ({
    id: 'p-1',
    conversationId: 'conv-1',
    userId: 'user-1',
    role: 'CLIENT',
    lastReadMessageNumber: 0,
    lastReceivedMessageNumber: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('sendMessage', () => {
    it('rejects empty content', async () => {
      await expect(
        service.sendMessage({ conversationId: 'conv-1', senderId: 'user-1', content: '' })
      ).rejects.toThrow(AppError);
    });

    it('rejects whitespace-only content', async () => {
      await expect(
        service.sendMessage({ conversationId: 'conv-1', senderId: 'user-1', content: '   ' })
      ).rejects.toThrow(AppError);
    });

    it('rejects content over 2000 characters', async () => {
      await expect(
        service.sendMessage({
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: 'a'.repeat(2001),
        })
      ).rejects.toThrow(AppError);
    });

    it('sends with default TEXT type when type is omitted', async () => {
      messageRepository.atomicSendMessage.mockResolvedValue(baseMessage);
      presence.setParticipantCounters.mockResolvedValue(undefined);

      await service.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello',
      });

      expect(messageRepository.atomicSendMessage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello',
        type: 'TEXT',
      });
    });

    it('sends with ORDER type when provided', async () => {
      messageRepository.atomicSendMessage.mockResolvedValue({ ...baseMessage, type: 'ORDER' });
      presence.setParticipantCounters.mockResolvedValue(undefined);

      await service.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Order details',
        type: 'ORDER',
      });

      expect(messageRepository.atomicSendMessage).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Order details',
        type: 'ORDER',
      });
    });

    it('returns the message from atomicSendMessage', async () => {
      messageRepository.atomicSendMessage.mockResolvedValue(baseMessage);
      presence.setParticipantCounters.mockResolvedValue(undefined);

      const result = await service.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello',
      });

      expect(result).toEqual(baseMessage);
    });

    it('syncs counters cache after sending', async () => {
      messageRepository.atomicSendMessage.mockResolvedValue({
        ...baseMessage,
        messageNumber: 5,
      });
      presence.setParticipantCounters.mockResolvedValue(undefined);

      await service.sendMessage({
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello',
      });

      expect(presence.setParticipantCounters).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastReceived: 5,
        lastRead: 5,
      });
    });

    it('propagates error when atomicSendMessage throws', async () => {
      messageRepository.atomicSendMessage.mockRejectedValue(new Error('DB error'));

      await expect(
        service.sendMessage({ conversationId: 'conv-1', senderId: 'user-1', content: 'Hello' })
      ).rejects.toThrow('DB error');
    });
  });

  describe('resolveParticipants', () => {
    it('returns partner IDs on cache hit', async () => {
      presence.getChatMembers.mockResolvedValue(['user-1', 'user-2']);

      const result = await service.resolveParticipants({
        conversationId: 'conv-1',
        userId: 'user-1',
      });

      expect(result).toEqual(['user-2']);
    });

    it('throws 403 when user is not in cached members', async () => {
      presence.getChatMembers.mockResolvedValue(['user-2', 'user-3']);

      await expect(
        service.resolveParticipants({ conversationId: 'conv-1', userId: 'user-1' })
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when no partner found in cache', async () => {
      presence.getChatMembers.mockResolvedValue(['user-1']);

      await expect(
        service.resolveParticipants({ conversationId: 'conv-1', userId: 'user-1' })
      ).rejects.toThrow(AppError);
    });

    it('falls back to DB on cache miss and caches result', async () => {
      presence.getChatMembers.mockResolvedValue(null);
      conversationRepository.findParticipants.mockResolvedValue({
        me: baseParticipant({ userId: 'user-1' }),
        others: [baseParticipant({ userId: 'user-2', id: 'p-2' })],
      });
      presence.addChatMembers.mockResolvedValue(undefined);

      const result = await service.resolveParticipants({
        conversationId: 'conv-1',
        userId: 'user-1',
      });

      expect(result).toEqual(['user-2']);
      expect(presence.addChatMembers).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userIds: ['user-1', 'user-2'],
      });
    });

    it('throws 403 when user is not a participant (DB)', async () => {
      presence.getChatMembers.mockResolvedValue(null);
      conversationRepository.findParticipants.mockResolvedValue({
        me: null,
        others: [],
      });

      await expect(
        service.resolveParticipants({ conversationId: 'conv-1', userId: 'user-1' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('markAsRead', () => {
    it('throws 404 when message not found', async () => {
      messageRepository.findById.mockResolvedValue(null);

      await expect(
        service.markAsRead({ conversationId: 'conv-1', userId: 'user-1', lastMessageId: 'msg-99' })
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when message belongs to a different conversation', async () => {
      messageRepository.findById.mockResolvedValue({ ...baseMessage, conversationId: 'conv-other' });

      await expect(
        service.markAsRead({ conversationId: 'conv-1', userId: 'user-1', lastMessageId: 'msg-1' })
      ).rejects.toThrow(AppError);
    });

    it('throws 403 when user is not a participant', async () => {
      messageRepository.findById.mockResolvedValue(baseMessage);
      conversationRepository.findParticipants.mockResolvedValue({ me: null, others: [] });

      await expect(
        service.markAsRead({ conversationId: 'conv-1', userId: 'user-1', lastMessageId: 'msg-1' })
      ).rejects.toThrow(AppError);
    });

    it('returns early without updating when already read', async () => {
      messageRepository.findById.mockResolvedValue({ ...baseMessage, messageNumber: 3 });
      conversationRepository.findParticipants.mockResolvedValue({
        me: baseParticipant({ lastReadMessageNumber: 5 }),
        others: [baseParticipant({ userId: 'user-2', id: 'p-2', lastReadMessageNumber: 5 })],
      });

      const result = await service.markAsRead({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastMessageId: 'msg-1',
      });

      expect(result).toEqual({ readUpTo: 3 });
      expect(conversationRepository.updateLastRead).not.toHaveBeenCalled();
    });

    it('updates lastRead and syncs cache on success', async () => {
      messageRepository.findById.mockResolvedValue({ ...baseMessage, messageNumber: 5 });
      conversationRepository.findParticipants.mockResolvedValue({
        me: baseParticipant({ lastReadMessageNumber: 2 }),
        others: [baseParticipant({ userId: 'user-2', id: 'p-2' })],
      });
      conversationRepository.updateLastRead.mockResolvedValue(
        baseParticipant({ lastReadMessageNumber: 5, lastReceivedMessageNumber: 5 })
      );
      presence.setParticipantCounters.mockResolvedValue(undefined);

      const result = await service.markAsRead({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastMessageId: 'msg-1',
      });

      expect(result).toEqual({ readUpTo: 5 });
      expect(conversationRepository.updateLastRead).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'user-1',
        messageNumber: 5,
      });
      expect(presence.setParticipantCounters).toHaveBeenCalled();
    });
  });

  describe('markAsDelivered', () => {
    it('throws 404 when message not found', async () => {
      messageRepository.findById.mockResolvedValue(null);

      await expect(
        service.markAsDelivered({
          conversationId: 'conv-1',
          userId: 'user-1',
          lastMessageId: 'msg-99',
        })
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when message belongs to a different conversation', async () => {
      messageRepository.findById.mockResolvedValue({ ...baseMessage, conversationId: 'conv-other' });

      await expect(
        service.markAsDelivered({
          conversationId: 'conv-1',
          userId: 'user-1',
          lastMessageId: 'msg-1',
        })
      ).rejects.toThrow(AppError);
    });

    it('throws 403 when user is not a participant', async () => {
      messageRepository.findById.mockResolvedValue(baseMessage);
      conversationRepository.findParticipants.mockResolvedValue({ me: null, others: [] });

      await expect(
        service.markAsDelivered({
          conversationId: 'conv-1',
          userId: 'user-1',
          lastMessageId: 'msg-1',
        })
      ).rejects.toThrow(AppError);
    });

    it('returns early without updating when already delivered', async () => {
      messageRepository.findById.mockResolvedValue({ ...baseMessage, messageNumber: 3 });
      conversationRepository.findParticipants.mockResolvedValue({
        me: baseParticipant({ lastReceivedMessageNumber: 5 }),
        others: [baseParticipant({ userId: 'user-2', id: 'p-2', lastReceivedMessageNumber: 5 })],
      });

      const result = await service.markAsDelivered({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastMessageId: 'msg-1',
      });

      expect(result).toEqual({ deliveredUpTo: 3 });
      expect(conversationRepository.updateLastReceived).not.toHaveBeenCalled();
    });

    it('updates lastReceived and syncs cache on success', async () => {
      messageRepository.findById.mockResolvedValue({ ...baseMessage, messageNumber: 5 });
      conversationRepository.findParticipants.mockResolvedValue({
        me: baseParticipant({ lastReceivedMessageNumber: 2 }),
        others: [baseParticipant({ userId: 'user-2', id: 'p-2' })],
      });
      conversationRepository.updateLastReceived.mockResolvedValue(
        baseParticipant({ lastReceivedMessageNumber: 5, lastReadMessageNumber: 2 })
      );
      presence.setParticipantCounters.mockResolvedValue(undefined);

      const result = await service.markAsDelivered({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastMessageId: 'msg-1',
      });

      expect(result).toEqual({ deliveredUpTo: 5 });
      expect(conversationRepository.updateLastReceived).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'user-1',
        messageNumber: 5,
      });
      expect(presence.setParticipantCounters).toHaveBeenCalled();
    });
  });

  describe('getOrCreateConversation', () => {
    it('throws 400 when workerId is missing', async () => {
      await expect(
        service.getOrCreateConversation({ workerId: undefined, clientId: 'client-1' })
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when clientId is missing', async () => {
      await expect(
        service.getOrCreateConversation({ workerId: 'worker-1', clientId: undefined })
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when worker and client are the same user', async () => {
      await expect(
        service.getOrCreateConversation({ workerId: 'user-1', clientId: 'user-1' })
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when worker profile not found', async () => {
      workerProfileRepository.find.mockResolvedValue(null);
      clientProfileRepository.find.mockResolvedValue({ id: 'cp-1' });

      await expect(
        service.getOrCreateConversation({ workerId: 'worker-1', clientId: 'client-1' })
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when client profile not found', async () => {
      workerProfileRepository.find.mockResolvedValue({ id: 'wp-1' });
      clientProfileRepository.find.mockResolvedValue(null);

      await expect(
        service.getOrCreateConversation({ workerId: 'worker-1', clientId: 'client-1' })
      ).rejects.toThrow(AppError);
    });

    it('returns existing conversation when pair exists', async () => {
      const existing = { id: 'conv-1', messageCounter: 5 };
      workerProfileRepository.find.mockResolvedValue({ id: 'wp-1' });
      clientProfileRepository.find.mockResolvedValue({ id: 'cp-1' });
      conversationRepository.findByPair.mockResolvedValue(existing);

      const result = await service.getOrCreateConversation({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(result).toEqual(existing);
      expect(conversationRepository.createWithParticipants).not.toHaveBeenCalled();
    });

    it('creates a new conversation when pair does not exist', async () => {
      workerProfileRepository.find.mockResolvedValue({ id: 'wp-1' });
      clientProfileRepository.find.mockResolvedValue({ id: 'cp-1' });
      conversationRepository.findByPair.mockResolvedValue(null);
      conversationRepository.createWithParticipants.mockResolvedValue({
        conversation: { id: 'conv-new', messageCounter: 0, createdAt: new Date(), updatedAt: new Date() },
        participants: [
          { userId: 'client-1', user: null },
          { userId: 'worker-1', user: { id: 'worker-1', firstName: 'Ahmed' } },
        ],
      });

      const result = await service.getOrCreateConversation({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(result.id).toBe('conv-new');
      expect(result.messageCounter).toBe(0);
      expect(result.unreadCount).toBe(0);
    });

    it('returns existing conversation on duplicate key race condition', async () => {
      const existing = { id: 'conv-existing', messageCounter: 3 };
      workerProfileRepository.find.mockResolvedValue({ id: 'wp-1' });
      clientProfileRepository.find.mockResolvedValue({ id: 'cp-1' });
      conversationRepository.findByPair
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existing);
      conversationRepository.createWithParticipants.mockRejectedValue(
        new RepositoryError('Duplicate', RepositoryErrorType.DUPLICATE_KEY)
      );

      const result = await service.getOrCreateConversation({
        workerId: 'worker-1',
        clientId: 'client-1',
      });

      expect(result).toEqual(existing);
    });
  });

  describe('validateParticipant', () => {
    it('returns the participant when user is valid', async () => {
      const me = baseParticipant({ userId: 'user-1', id: 'p-1' });
      conversationRepository.findParticipants.mockResolvedValue({
        me,
        others: [baseParticipant({ userId: 'user-2', id: 'p-2' })],
      });

      const result = await service.validateParticipant({
        conversationId: 'conv-1',
        userId: 'user-1',
      });

      expect(result).toEqual(me);
    });

    it('throws 403 when user is not a participant', async () => {
      conversationRepository.findParticipants.mockResolvedValue({
        me: null,
        others: [],
      });

      await expect(
        service.validateParticipant({ conversationId: 'conv-1', userId: 'user-1' })
      ).rejects.toThrow(AppError);
    });
  });
});
