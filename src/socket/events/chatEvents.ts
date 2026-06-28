import Events from './Events.js';
import { IDType } from '../../repositories/interfaces/Repository.js';
import { Message } from '../../domain/conversation.entity.js';
import { logger } from '../../libs/winston.js';
import { contentDetection } from '../../queue/register.js';
import IChatService from '../../services/interfaces/IChatService.js';
import INotificationService from '../../services/interfaces/INotificationService.js';
import ISocketemitter from '../interfaces/ISocketEmitter.js';

type AckFn = (response: {
  ok: boolean;
  error?: string;
  message?: Message;
  readUpTo?: number;
  deliveredUpTo?: number;
}) => void;

export default class ChatEvents extends Events {
  private chatService: IChatService;
  private notificationService: INotificationService;
  private emitter: ISocketemitter;

  constructor(params: {
    chatService: IChatService;
    notificationService: INotificationService;
    emitter: ISocketemitter;
  }) {
    super();
    this.chatService = params.chatService;
    this.notificationService = params.notificationService;
    this.emitter = params.emitter;
  }

  private handleSendMessage(userId: string) {
    return async (
      {
        conversationId,
        content,
        type = 'TEXT',
      }: { conversationId: string; content: string; type?: string },
      ack?: AckFn
    ): Promise<void> => {
      try {
        if (type !== 'TEXT' && type !== 'ORDER') {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'Invalid message type' });
          }
          return null;
        }

        const partnerIds = await this.chatService.resolveParticipants({ conversationId, userId });

        const message = await this.chatService.sendMessage({
          conversationId,
          senderId: userId,
          content,
          type,
        });

        contentDetection(message);

        if (partnerIds.length > 0) {
          for (const partnerId of partnerIds) {
            const online = await this.chatService.presence.isOnline({ userId: partnerId });
            if (!online) {
              const senderName = [
                message.sender?.firstName,
                message.sender?.middleName,
                message.sender?.lastName,
              ]
                .filter(Boolean)
                .join(' ');
              this.notificationService
                .notify(partnerId, {
                  type: 'NEW_MESSAGE',
                  ctx: { conversationId, senderName, content: message.content },
                })
                .catch(() => {});
            } else {
              this.emitter.ToUser(partnerId, 'new_message', { message, conversationId });
            }
          }
        }

        if (typeof ack === 'function') {
          ack({ ok: true, message });
        }
      } catch (err: unknown) {
        logger.error('[socket] send_message error', err);
        if (err instanceof Error && typeof ack === 'function')
          ack({ ok: false, error: err.message });
      }
    };
  }

  private handleRead(userId: string) {
    return async (
      { conversationId, lastMessageId }: { conversationId: string; lastMessageId: IDType },
      ack?: AckFn
    ): Promise<void> => {
      try {
        const partnerIds = await this.chatService.resolveParticipants({ conversationId, userId });

        const { readUpTo } = await this.chatService.markAsRead({
          conversationId,
          userId,
          lastMessageId,
        });

        if (partnerIds.length > 0) {
          for (const partnerId of partnerIds) {
            this.emitter.ToUser(partnerId, 'messages_read', { conversationId, readUpTo });
          }
        }

        if (typeof ack === 'function') ack({ ok: true, readUpTo: readUpTo });
      } catch (err: unknown) {
        logger.error('[socket] read error', err);
        if (err instanceof Error && typeof ack === 'function')
          ack({ ok: false, error: err.message });
      }
    };
  }

  private handleDelivered(userId: string) {
    return async (
      { conversationId, lastMessageId }: { conversationId: string; lastMessageId: IDType },
      ack?: AckFn
    ): Promise<void> => {
      try {
        const partnerIds = await this.chatService.resolveParticipants({ conversationId, userId });

        const { deliveredUpTo } = await this.chatService.markAsDelivered({
          conversationId,
          userId,
          lastMessageId,
        });
        if (partnerIds.length > 0) {
          for (const partnerId of partnerIds) {
            this.emitter.ToUser(partnerId, 'messages_delivered', {
              conversationId,
              deliveredUpTo,
            });
          }
        }

        if (typeof ack === 'function') ack({ ok: true, deliveredUpTo });
      } catch (err: unknown) {
        logger.error('[socket] delivered error', err);
        if (err instanceof Error && typeof ack === 'function')
          ack({ ok: false, error: err.message });
      }
    };
  }

  register(socket: import('socket.io').Socket): void {
    const { userId } = socket.data;

    socket.on('send_message', this.handleSendMessage(userId));
    socket.on('read', this.handleRead(userId));
    socket.on('delivered', this.handleDelivered(userId));
    return null;
  }
}
