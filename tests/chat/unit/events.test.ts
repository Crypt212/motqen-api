import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatEvents from '../../../src/socket/events/chatEvents';
import AppError from '../../../src/errors/AppError';

vi.mock('../../../src/queue/register.js', () => ({
  contentDetection: vi.fn(),
}));

import { contentDetection } from '../../../src/queue/register.js';

describe('ChatEvents', () => {
  let chatService: any;
  let notificationService: any;
  let emitter: any;
  let socket: any;
  let handlers: Record<string, any>;

  const ack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = {};

    chatService = {
      resolveParticipants: vi.fn(),
      sendMessage: vi.fn(),
      markAsRead: vi.fn(),
      markAsDelivered: vi.fn(),
      presence: {
        isOnline: vi.fn(),
      },
    };

    notificationService = {
      notify: vi.fn().mockResolvedValue(undefined),
    };

    emitter = {
      ToUser: vi.fn(),
    };

    socket = {
      data: { userId: 'user-1' },
      on: vi.fn((event: string, handler: Function) => {
        handlers[event] = handler;
      }),
    };
  });

  function createEvents() {
    const events = new ChatEvents({ chatService, emitter, notificationService });
    events.register(socket);
    return events;
  }

  const baseMessage = {
    id: 'msg-1',
    content: 'Hello',
    sender: { firstName: 'Ahmed', middleName: '', lastName: 'Mohamed' },
  };

  describe('send_message', () => {
    describe('type validation', () => {
      it.each(['UNKNOWN', 'IMAGE', '', 'text', 'order'])(
        'rejects invalid type "%s"',
        async (type) => {
          createEvents();
          const res = await handlers.send_message({ conversationId: 'conv-1', content: 'hi', type }, ack);

          expect(res).toBe(null);
          expect(ack).toHaveBeenCalledWith({ ok: false, error: 'Invalid message type' });
        }
      );

      it.each(['TEXT', 'ORDER'])('accepts valid type "%s"', async (type) => {
        chatService.resolveParticipants.mockResolvedValue([]);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'hi', type }, ack);

        expect(ack).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
      });
    });

    describe('ack behavior', () => {
      it('does not crash when ack is not provided', async () => {
        chatService.resolveParticipants.mockResolvedValue(['user-2']);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        chatService.presence.isOnline.mockResolvedValue(true);
        createEvents();

        await expect(
          handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, undefined)
        ).resolves.not.toThrow();
      });

      it('acks with the sent message on success', async () => {
        chatService.resolveParticipants.mockResolvedValue([]);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(ack).toHaveBeenCalledWith({ ok: true, message: baseMessage });
      });
    });

    describe('participant delivery', () => {
      it('emits to online partner and does not send notification', async () => {
        chatService.resolveParticipants.mockResolvedValue(['user-2']);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        chatService.presence.isOnline.mockResolvedValue(true);
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(emitter.ToUser).toHaveBeenCalledWith('user-2', 'new_message', {
          message: baseMessage,
          conversationId: 'conv-1',
        });
        expect(notificationService.notify).not.toHaveBeenCalled();
      });

      it('sends notification to offline partner and does not emit', async () => {
        chatService.resolveParticipants.mockResolvedValue(['user-2']);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        chatService.presence.isOnline.mockResolvedValue(false);
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(notificationService.notify).toHaveBeenCalledWith('user-2', {
          type: 'NEW_MESSAGE',
          ctx: { conversationId: 'conv-1', senderName: 'Ahmed Mohamed', content: 'Hello' },
        });
        expect(emitter.ToUser).not.toHaveBeenCalled();
      });

      it('emits to online partner and notifies offline partner', async () => {
        chatService.resolveParticipants.mockResolvedValue(['user-2', 'user-3']);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        chatService.presence.isOnline.mockImplementation(async ({ userId }) => userId === 'user-2');
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(emitter.ToUser).toHaveBeenCalledWith('user-2', 'new_message', expect.any(Object));
        expect(notificationService.notify).toHaveBeenCalledWith('user-3', expect.any(Object));
      });

      it('includes middleName in sender name when present', async () => {
        chatService.resolveParticipants.mockResolvedValue(['user-2']);
        chatService.sendMessage.mockResolvedValue({
          ...baseMessage,
          sender: { firstName: 'Ahmed', middleName: 'Ali', lastName: 'Mohamed' },
        });
        chatService.presence.isOnline.mockResolvedValue(false);
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(notificationService.notify).toHaveBeenCalledWith(
          'user-2',
          expect.objectContaining({
            ctx: expect.objectContaining({ senderName: 'Ahmed Ali Mohamed' }),
          })
        );
      });

      it('skips notification when notify rejects', async () => {
        chatService.resolveParticipants.mockResolvedValue(['user-2']);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        chatService.presence.isOnline.mockResolvedValue(false);
        notificationService.notify.mockRejectedValue(new Error('FCM failed'));
        createEvents();

        await expect(
          handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack)
        ).resolves.not.toThrow();

        expect(ack).toHaveBeenCalledWith({ ok: true, message: baseMessage });
      });

      it('acks successfully when there are no other participants', async () => {
        chatService.resolveParticipants.mockResolvedValue([]);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(ack).toHaveBeenCalledWith({ ok: true, message: baseMessage });
        expect(emitter.ToUser).not.toHaveBeenCalled();
        expect(notificationService.notify).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('acks error when resolveParticipants throws', async () => {
        chatService.resolveParticipants.mockRejectedValue(new AppError('Not a participant', 403));
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(ack).toHaveBeenCalledWith({ ok: false, error: 'Not a participant' });
      });

      it('acks error when sendMessage throws', async () => {
        chatService.resolveParticipants.mockResolvedValue(['user-2']);
        chatService.sendMessage.mockRejectedValue(new AppError('Content too long', 400));
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'x'.repeat(2001) }, ack);

        expect(ack).toHaveBeenCalledWith({ ok: false, error: 'Content too long' });
      });

      it('does not crash on non-Error thrown values', async () => {
        chatService.resolveParticipants.mockRejectedValue('string error');
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(ack).not.toHaveBeenCalled();
      });
    });

    describe('side effects', () => {
      it('calls contentDetection with the message', async () => {
        chatService.resolveParticipants.mockResolvedValue([]);
        chatService.sendMessage.mockResolvedValue(baseMessage);
        createEvents();

        await handlers.send_message({ conversationId: 'conv-1', content: 'Hello' }, ack);

        expect(contentDetection).toHaveBeenCalledWith(baseMessage);
      });
    });
  });

  describe('read', () => {
    it('marks as read, emits to partners, and acks with readUpTo', async () => {
      chatService.resolveParticipants.mockResolvedValue(['user-2']);
      chatService.markAsRead.mockResolvedValue({ readUpTo: 5 });
      createEvents();

      await handlers.read({ conversationId: 'conv-1', lastMessageId: 'msg-5' }, ack);

      expect(chatService.markAsRead).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastMessageId: 'msg-5',
      });
      expect(emitter.ToUser).toHaveBeenCalledWith('user-2', 'messages_read', {
        conversationId: 'conv-1',
        readUpTo: 5,
      });
      expect(ack).toHaveBeenCalledWith({ ok: true, readUpTo: 5 });
    });

    it('acks successfully when there are no other participants', async () => {
      chatService.resolveParticipants.mockResolvedValue([]);
      chatService.markAsRead.mockResolvedValue({ readUpTo: 3 });
      createEvents();

      await handlers.read({ conversationId: 'conv-1', lastMessageId: 'msg-3' }, ack);

      expect(ack).toHaveBeenCalledWith({ ok: true, readUpTo: 3 });
      expect(emitter.ToUser).not.toHaveBeenCalled();
    });

    it('does not crash when ack is not provided', async () => {
      chatService.resolveParticipants.mockResolvedValue(['user-2']);
      chatService.markAsRead.mockResolvedValue({ readUpTo: 5 });
      createEvents();

      await expect(
        handlers.read({ conversationId: 'conv-1', lastMessageId: 'msg-5' }, undefined)
      ).resolves.not.toThrow();
    });

    it('acks error when resolveParticipants throws', async () => {
      chatService.resolveParticipants.mockRejectedValue(new AppError('Not a participant', 403));
      createEvents();

      await handlers.read({ conversationId: 'conv-1', lastMessageId: 'msg-5' }, ack);

      expect(ack).toHaveBeenCalledWith({ ok: false, error: 'Not a participant' });
    });

    it('acks error when markAsRead throws', async () => {
      chatService.resolveParticipants.mockResolvedValue(['user-2']);
      chatService.markAsRead.mockRejectedValue(new AppError('Message not found', 404));
      createEvents();

      await handlers.read({ conversationId: 'conv-1', lastMessageId: 'msg-99' }, ack);

      expect(ack).toHaveBeenCalledWith({ ok: false, error: 'Message not found' });
    });
  });

  describe('delivered', () => {
    it('marks as delivered, emits to partners, and acks with deliveredUpTo', async () => {
      chatService.resolveParticipants.mockResolvedValue(['user-2']);
      chatService.markAsDelivered.mockResolvedValue({ deliveredUpTo: 7 });
      createEvents();

      await handlers.delivered({ conversationId: 'conv-1', lastMessageId: 'msg-7' }, ack);

      expect(chatService.markAsDelivered).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        userId: 'user-1',
        lastMessageId: 'msg-7',
      });
      expect(emitter.ToUser).toHaveBeenCalledWith('user-2', 'messages_delivered', {
        conversationId: 'conv-1',
        deliveredUpTo: 7,
      });
      expect(ack).toHaveBeenCalledWith({ ok: true, deliveredUpTo: 7 });
    });

    it('acks successfully when there are no other participants', async () => {
      chatService.resolveParticipants.mockResolvedValue([]);
      chatService.markAsDelivered.mockResolvedValue({ deliveredUpTo: 4 });
      createEvents();

      await handlers.delivered({ conversationId: 'conv-1', lastMessageId: 'msg-4' }, ack);

      expect(ack).toHaveBeenCalledWith({ ok: true, deliveredUpTo: 4 });
      expect(emitter.ToUser).not.toHaveBeenCalled();
    });

    it('does not crash when ack is not provided', async () => {
      chatService.resolveParticipants.mockResolvedValue(['user-2']);
      chatService.markAsDelivered.mockResolvedValue({ deliveredUpTo: 7 });
      createEvents();

      await expect(
        handlers.delivered({ conversationId: 'conv-1', lastMessageId: 'msg-7' }, undefined)
      ).resolves.not.toThrow();
    });

    it('acks error when resolveParticipants throws', async () => {
      chatService.resolveParticipants.mockRejectedValue(new AppError('Not a participant', 403));
      createEvents();

      await handlers.delivered({ conversationId: 'conv-1', lastMessageId: 'msg-7' }, ack);

      expect(ack).toHaveBeenCalledWith({ ok: false, error: 'Not a participant' });
    });

    it('acks error when markAsDelivered throws', async () => {
      chatService.resolveParticipants.mockResolvedValue(['user-2']);
      chatService.markAsDelivered.mockRejectedValue(new AppError('Message not found', 404));
      createEvents();

      await handlers.delivered({ conversationId: 'conv-1', lastMessageId: 'msg-99' }, ack);

      expect(ack).toHaveBeenCalledWith({ ok: false, error: 'Message not found' });
    });
  });

  describe('register', () => {
    it('registers send_message, read, and delivered handlers', () => {
      createEvents();

      expect(socket.on).toHaveBeenCalledWith('send_message', expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith('read', expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith('delivered', expect.any(Function));
    });
  });
});
