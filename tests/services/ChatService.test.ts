/**
 * ChatService Tests
 *
 * Chat is the core real-time feature connecting workers and clients:
 *   - Conversation creation: 1 worker + 1 client, validated at profile level
 *   - Idempotent getOrCreate: same pair → same conversation
 *   - Race condition handling: concurrent creates don't blow up
 *   - Message sending: atomic counter + insert via transaction
 *   - Read state: cross-conversation attack prevention
 *   - Participant validation: DB-authoritative access control
 *   - Unread count derivation from messageCounter - lastReadMessageNumber
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatService from '../../src/services/ChatService.js';
import AppError from '../../src/errors/AppError.js';
import RepositoryError, { RepositoryErrorType } from '../../src/errors/RepositoryError.js';
import {
  createMockConversationRepository,
  createMockMessageRepository,
  createMockWorkerProfileRepository,
  createMockClientProfileRepository,
  createMockChatPresenceCache,
  makeWorkerProfile,
  makeConversation,
  makeParticipant,
  makeMessage,
} from '../helpers/mocks.js';

// Mock the prisma $transaction — ChatService imports prisma directly for sendMessage
vi.mock('../../src/libs/database.js', () => ({
  default: {
    $transaction: vi.fn(),
  },
}));

describe('ChatService', () => {
  let chatService: ChatService;
  let convRepo: ReturnType<typeof createMockConversationRepository>;
  let msgRepo: ReturnType<typeof createMockMessageRepository>;
  let workerRepo: ReturnType<typeof createMockWorkerProfileRepository>;
  let clientRepo: ReturnType<typeof createMockClientProfileRepository>;
  let presenceCache: ReturnType<typeof createMockChatPresenceCache>;

  beforeEach(() => {
    convRepo = createMockConversationRepository();
    msgRepo = createMockMessageRepository();
    workerRepo = createMockWorkerProfileRepository();
    clientRepo = createMockClientProfileRepository();
    presenceCache = createMockChatPresenceCache();

    chatService = new ChatService({
      conversationRepository: convRepo,
      messageRepository: msgRepo,
      workerProfileRepository: workerRepo,
      clientProfileRepository: clientRepo,
      presence: presenceCache,
    });
  });

  // ─── getOrCreateConversation ─────────────────────────────────────────────

  describe('getOrCreateConversation', () => {
    it('should prevent self-conversations', async () => {
      await expect(
        chatService.getOrCreateConversation({
          workerId: 'user-1',
          clientId: 'user-1',
        })
      ).rejects.toThrow('A user cannot start a conversation with themselves');
    });

    it('should reject when worker profile does not exist', async () => {
      workerRepo.find.mockResolvedValue(null);

      await expect(
        chatService.getOrCreateConversation({
          workerId: 'user-1',
          clientId: 'user-2',
        })
      ).rejects.toThrow('Worker profile not found');
    });

    it('should return existing conversation instead of creating duplicate', async () => {
      const existing = makeConversation();
      workerRepo.find.mockResolvedValue(makeWorkerProfile());
      convRepo.findByPair.mockResolvedValue(existing);

      const result = await chatService.getOrCreateConversation({
        workerId: 'user-1',
        clientId: 'user-2',
      });

      expect(result).toEqual(existing);
      // Should NOT try to create
      expect(convRepo.createWithParticipants).not.toHaveBeenCalled();
    });

    it('should create new conversation when pair does not exist', async () => {
      const newConv = makeConversation({ id: 'new-conv' });
      workerRepo.find.mockResolvedValue(makeWorkerProfile());
      convRepo.findByPair.mockResolvedValue(null); // no existing
      convRepo.createWithParticipants.mockResolvedValue({ conversation: newConv });

      const result = await chatService.getOrCreateConversation({
        workerId: 'user-1',
        clientId: 'user-2',
      });

      expect(result.id).toBe('new-conv');
    });

    it('should handle race condition (UNIQUE violation) gracefully', async () => {
      const raceConv = makeConversation({ id: 'race-winner' });
      workerRepo.find.mockResolvedValue(makeWorkerProfile());
      convRepo.findByPair
        .mockResolvedValueOnce(null) // first check: not found
        .mockResolvedValueOnce(raceConv); // retry after race: found

      convRepo.createWithParticipants.mockRejectedValue(
        new RepositoryError('duplicate', RepositoryErrorType.DUPLICATE_KEY)
      );

      const result = await chatService.getOrCreateConversation({
        workerId: 'user-1',
        clientId: 'user-2',
      });

      expect(result.id).toBe('race-winner');
    });
  });

  // ─── markAsRead ──────────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('should reject cross-conversation read attacks', async () => {
      // Message belongs to conv-1, but user tries to mark it read in conv-2
      msgRepo.findById.mockResolvedValue(makeMessage({ conversationId: 'conv-1' }));

      await expect(
        chatService.markAsRead({
          conversationId: 'conv-2', // wrong conversation
          userId: 'user-1',
          lastMessageId: 'msg-1',
        })
      ).rejects.toThrow('Message does not belong to this conversation');
    });

    it('should 404 when message does not exist', async () => {
      msgRepo.findById.mockResolvedValue(null);

      await expect(
        chatService.markAsRead({
          conversationId: 'conv-1',
          userId: 'user-1',
          lastMessageId: 'nonexistent',
        })
      ).rejects.toThrow('Message not found');
    });

    it('should update lastRead and return the messageNumber', async () => {
      const msg = makeMessage({ messageNumber: 42, conversationId: 'conv-1' });
      msgRepo.findById.mockResolvedValue(msg);
      convRepo.updateLastRead.mockResolvedValue(undefined);

      const result = await chatService.markAsRead({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastMessageId: 'msg-1',
      });

      expect(result.readUpTo).toBe(42);
      expect(convRepo.updateLastRead).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'user-1',
        messageNumber: 42,
      });
    });
  });

  // ─── markAllAsRead ───────────────────────────────────────────────────────

  describe('markAllAsRead', () => {
    it('should bump both read AND received to current messageCounter', async () => {
      convRepo.find.mockResolvedValue(makeConversation({ messageCounter: 15 }));
      convRepo.updateLastRead.mockResolvedValue(undefined);
      convRepo.updateLastReceived.mockResolvedValue(undefined);

      await chatService.markAllAsRead({
        conversationId: 'conv-1',
        userId: 'user-1',
      });

      expect(convRepo.updateLastRead).toHaveBeenCalledWith(
        expect.objectContaining({ messageNumber: 15 })
      );
      expect(convRepo.updateLastReceived).toHaveBeenCalledWith(
        expect.objectContaining({ messageNumber: 15 })
      );
    });

    it('should 404 when conversation does not exist', async () => {
      convRepo.find.mockResolvedValue(null);

      await expect(
        chatService.markAllAsRead({ conversationId: 'nope', userId: 'user-1' })
      ).rejects.toThrow('Conversation not found');
    });
  });

  // ─── sendMessage ─────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should reject empty messages', async () => {
      await expect(
        chatService.sendMessage({
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: '   ',
        })
      ).rejects.toThrow('Message content cannot be empty');
    });

    it('should reject messages exceeding 2000 characters', async () => {
      await expect(
        chatService.sendMessage({
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: 'x'.repeat(2001),
        })
      ).rejects.toThrow('Message content cannot exceed 2000 characters');
    });
  });

  // ─── getMessages ─────────────────────────────────────────────────────────

  describe('getMessages', () => {
    it('should reject non-participants from reading messages', async () => {
      convRepo.findParticipant.mockResolvedValue(null);

      await expect(
        chatService.getMessages({
          conversationId: 'conv-1',
          userId: 'outsider',
          after: 0,
          limit: 30,
        })
      ).rejects.toThrow('not participate');
    });

    it('should return messages for valid participants', async () => {
      const participant = makeParticipant();
      const messages = [makeMessage(), makeMessage({ id: 'msg-2', messageNumber: 2 })];
      convRepo.findParticipant.mockResolvedValue(participant);
      msgRepo.findPage.mockResolvedValue(messages);

      const result = await chatService.getMessages({
        conversationId: 'conv-1',
        userId: 'user-1',
        after: 0,
        limit: 30,
      });

      expect(result).toHaveLength(2);
    });
  });

  // ─── validateParticipant ─────────────────────────────────────────────────

  describe('validateParticipant', () => {
    it('should return participant when valid', async () => {
      const participant = makeParticipant();
      convRepo.findParticipant.mockResolvedValue(participant);

      const result = await chatService.validateParticipant({
        conversationId: 'conv-1',
        userId: 'user-1',
      });

      expect(result).toEqual(participant);
    });

    it('should throw 403 for non-participants', async () => {
      convRepo.findParticipant.mockResolvedValue(null);

      const err = chatService.validateParticipant({
        conversationId: 'conv-1',
        userId: 'hacker',
      });

      await expect(err).rejects.toThrow('Not a participant');
    });
  });

  // ─── presence getter ─────────────────────────────────────────────────────

  describe('presence', () => {
    it('should expose the injected presence cache', () => {
      expect(chatService.presence).toBe(presenceCache);
    });
  });
});
