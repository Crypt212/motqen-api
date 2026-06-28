import Events from './Events.js';
import { logger } from 'src/libs/winston.js';
import IChatService from 'src/services/interfaces/IChatService.js';
import IUserRepository from 'src/repositories/interfaces/UserRepository.js';
import ISocketemitter from '../interfaces/ISocketEmitter.js';

type AckFn = (response: { ok: boolean; error?: string; isPartnerOnline?: boolean }) => void;

export default class PresenceEvents extends Events {
  private chatService: IChatService;
  private userRepository: IUserRepository;
  private emitter: ISocketemitter;

  constructor(params: {
    chatService: IChatService;
    userRepository: IUserRepository;
    emitter: ISocketemitter;
  }) {
    super();
    this.chatService = params.chatService;
    this.userRepository = params.userRepository;
    this.emitter = params.emitter;
  }

  private handlePing(userId: string) {
    return async ({ partnerId }: { partnerId?: string } = {}): Promise<void> => {
      const presence = this.chatService.presence;

      void presence.refreshPresence({ userId });

      if (partnerId) {
        void presence.refreshChatEnterTTL({ partnerId });
      }
    };
  }

  private handleTypingIndicator(userId: string) {
    return async ({
      conversationId,
      isTyping,
    }: {
      conversationId: string;
      isTyping: boolean;
    }): Promise<void> => {
      try {
        const presence = this.chatService.presence;
        const [partnerId] = await this.chatService.resolveParticipants({ conversationId, userId });

        const inChat = await presence.isViewingMyChat({ viewerId: userId, userId: partnerId });
        if (!inChat) return;

        if (isTyping) {
          void presence.setTyping({ conversationId, userId });
        } else {
          void presence.clearTyping({ conversationId, userId });
        }

        if (partnerId) {
          this.emitter.ToUser(partnerId, 'typing', { conversationId, userId, isTyping });
        }
      } catch (err) {
        logger.error('[socket] typing_indicator error', err);
      }
    };
  }

  private handleEnterChat(userId: string) {
    return async (
      { conversationId }: { conversationId: string },
      ack?: AckFn
    ): Promise<void> => {
      try {
        const presence = this.chatService.presence;
        const [partnerId] = await this.chatService.resolveParticipants({ conversationId, userId });

        void presence.enterChat({ userId, partnerId });

        let isPartnerOnline = false;

        if (partnerId) {
          isPartnerOnline = await presence.isOnline({ userId: partnerId });
          this.emitter.ToUser(partnerId, 'partner_entered_chat', { conversationId });
        }

        const snapshot = await this.chatService.getChatSnapshot({ conversationId, userId });

        if (typeof ack === 'function') ack({ ok: true, isPartnerOnline, ...snapshot });
      } catch (err: unknown) {
        logger.error('[socket] enter_chat error', err);
        if (err instanceof Error && typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    };
  }

  private handleLeaveChat(userId: string) {
    return async (
      { conversationId }: { conversationId: string },
      ack?: AckFn
    ): Promise<void> => {
      try {
        const presence = this.chatService.presence;
        const [partnerId] = await this.chatService.resolveParticipants({ conversationId, userId });

        void presence.leaveChat({ userId, partnerId });

        if (partnerId) {
          this.emitter.ToUser(partnerId, 'partner_left_chat', { conversationId });
        }

        if (typeof ack === 'function') ack({ ok: true });
      } catch (err: unknown) {
        logger.error('[socket] leave_chat error', err);
        if (err instanceof Error && typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    };
  }

  private handleDisconnect(userId: string, socket: import('socket.io').Socket) {
    return async (): Promise<void> => {
      try {
        const presence = this.chatService.presence;

        await presence.removeSocket({ userId });
        await presence.removeFromAllEnterSets({ userId });
        await this.userRepository.update({ filter: { id: userId }, user: { isOnline: false } });
        socket.to(`presence:${userId}`).emit('partner_offline', { userId });
      } catch (err) {
        logger.error('[socket] disconnect cleanup error', err);
      }
    };
  }

  register(socket: import('socket.io').Socket): void {
    const { userId } = socket.data;

    socket.on('ping', this.handlePing(userId));
    socket.on('typing_indicator', this.handleTypingIndicator(userId));
    socket.on('enter_chat', this.handleEnterChat(userId));
    socket.on('leave_chat', this.handleLeaveChat(userId));
    socket.on('disconnect', this.handleDisconnect(userId, socket));
    return null;
  }
}
