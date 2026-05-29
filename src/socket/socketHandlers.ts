/**
 * @fileoverview socketHandlers - All Socket.IO event handlers
 * @module socket/socketHandlers
 *
 * Event contract (client ↔ server):
 *
 * CLIENT emits:
 *   send_message     { conversationId, content, type? }
 *   read             { conversationId, lastMessageId }
 *   typing_indicator { conversationId, isTyping: boolean }
 *   enter_chat       { conversationId }
 *   leave_chat       { conversationId }
 *
 * SERVER emits:
 *   new_message            { message, conversationId }          → partner room
 *   messages_read          { conversationId, readUpTo }         → partner room
 *   messages_delivered     { conversationId, deliveredUpTo }    → sender room
 *   typing                 { conversationId, userId, isTyping } → partner room
 *   partner_entered_chat   { conversationId }                   → partner room
 *   partner_left_chat      { conversationId }                   → partner room
 *   partner_online         { userId }                           → presence rooms
 *   missed_conversations   { conversationId, unreadCount }      → reconnecting user
 *   pong                                                        → requesting socket
 */

import { logger } from '../libs/winston.js';
import { chatService, conversationRepository, contactDetectionService } from '../state.js';

/**
 * Register all event handlers for a connected socket.
 */
export function registerSocketHandlers(
  io: import('socket.io').Server,
  socket: import('socket.io').Socket
) {
  const { userId } = socket.data;
  const presence = chatService.presence;

  // ─── ping / pong (keep-alive + TTL refresh) ────────────────────────────────
  socket.on('ping', async ({ partnerId }: { partnerId?: string } = {}) => {
    void presence.refreshPresence({ userId });

    // If user is actively viewing a partner's chat, refresh the enter TTL
    if (partnerId) {
      void presence.refreshChatEnterTTL({ partnerId });
    }

    socket.emit('pong');
  });

  // ─── send_message ───────────────────────────────────────────────────────────
  socket.on('send_message', async ({ conversationId, content, type = 'TEXT', localId }, ack) => {
    try {
      if (type !== 'TEXT') {
        if (typeof ack === 'function') {
          ack({ ok: false, error: 'Invalid message type' });
        }
        return;
      }

      // 1. Cached participant validation + partner ID lookup (Redis → DB fallback)
      const partnerId = await chatService.getPartnerIdCached({ conversationId, userId });

      // 2. Send the message (atomic counter increment + insert in tx)
      //    sendMessage also auto-updates sender's lastReceivedMessageNumber
      const message = await chatService.sendMessage({
        conversationId,
        senderId: userId,
        content,
        type,
      });

      // Fire and forget: Non-blocking contact detection
      setImmediate(() => {
        contactDetectionService
          .analyzeAndFlagMessage(message)
          .then((data) => console.log(data))
          .catch((err) => {
            logger.error('[socket] Contact detection failed', err);
          });
      });

      // 3. Check recipient presence
      const [delivered, recipientInChat] = await Promise.all([
        presence.isOnline({ userId: partnerId }),
        presence.isViewingMyChat({ viewerId: partnerId, userId }),
      ]);

      // 4. If recipient is online → mark as delivered in DB
      if (delivered && partnerId) {
        await chatService.markAsDelivered({
          conversationId,
          userId: partnerId,
          messageNumber: message.messageNumber,
        });

        // Notify sender that their message was delivered
        socket.emit('messages_delivered', {
          conversationId,
          deliveredUpTo: message.messageNumber,
        });
      }

      // 5. If recipient is inside this chat → auto-mark as read immediately
      if (recipientInChat) {
        await chatService.markAllAsRead({ conversationId, userId: partnerId });
      }

      // 6. Emit new_message to recipient
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('new_message', { message, conversationId });
      }

      // 7. ACK sender with delivery + read status
      if (typeof ack === 'function') {
        ack({
          ok: true,
          message,
          delivered,
          read: recipientInChat,
          localId,
        });
      }
    } catch (err: unknown) {
      logger.error('[socket] send_message error', err);
      if (err instanceof Error && typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });

  // ─── read ───────────────────────────────────────────────────────────────────
  socket.on('read', async ({ conversationId, lastMessageId }, ack) => {
    try {
      // 1. Cached participant validation + partner ID lookup
      const partnerId = await chatService.getPartnerIdCached({ conversationId, userId });

      // 2. Mark as read (validates message belongs to this conversation)
      const { readUpTo } = await chatService.markAsRead({ conversationId, userId, lastMessageId });

      // 3. Notify partner
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('messages_read', { conversationId, readUpTo });
      }

      if (typeof ack === 'function') ack({ ok: true, readUpTo });
    } catch (err: unknown) {
      logger.error('[socket] read error', err);
      if (err instanceof Error && typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });

  // ─── typing_indicator ───────────────────────────────────────────────────────
  socket.on('typing_indicator', async ({ conversationId, isTyping }) => {
    try {
      // Use getPartnerIdCached for validation + partner lookup
      const partnerId = await chatService.getPartnerIdCached({ conversationId, userId });

      // Only emit typing if the current user is inside the partner's chat screen (soft-auth)
      const inChat = await presence.isViewingMyChat({ viewerId: userId, userId: partnerId });
      if (!inChat) return; // silently ignore if user hasn't entered chat

      if (isTyping) {
        void presence.setTyping({ conversationId, userId });
      } else {
        void presence.clearTyping({ conversationId, userId });
      }

      // Emit to partner only
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('typing', { conversationId, userId, isTyping });
      }
    } catch (err) {
      logger.error('[socket] typing_indicator error', err);
    }
  });

  // ─── enter_chat ─────────────────────────────────────────────────────────────
  socket.on('enter_chat', async ({ conversationId }, ack) => {
    try {
      // 1. Cached participant validation + partner ID lookup
      const partnerId = await chatService.getPartnerIdCached({ conversationId, userId });

      // 2. Track user as viewing partner's chat screen
      void presence.enterChat({ userId, partnerId });

      // 3. Auto-mark all messages as read (also bumps lastReceivedMessageNumber)
      await chatService.markAllAsRead({ conversationId, userId });

      let isPartnerOnline = false;

      if (partnerId) {
        isPartnerOnline = await presence.isOnline({ userId: partnerId });

        // Auto-subscribe to partner's online/offline presence updates
        void socket.join(`presence:${partnerId}`);

        io.to(`user:${partnerId}`).emit('partner_entered_chat', { conversationId });

        // Tell partner their messages are delivered (up to the current messageCounter)
        const conv = await conversationRepository.findById({ id: conversationId });
        if (conv) {
          io.to(`user:${partnerId}`).emit('messages_delivered', {
            conversationId,
            deliveredUpTo: conv.messageCounter,
          });
        }
      }

      if (typeof ack === 'function') ack({ ok: true, isPartnerOnline });
    } catch (err: unknown) {
      logger.error('[socket] enter_chat error', err);
      if (err instanceof Error && typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });

  // ─── leave_chat ─────────────────────────────────────────────────────────────
  socket.on('leave_chat', async ({ conversationId }, ack) => {
    try {
      // Use cached lookup to get partnerId
      const partnerId = await chatService.getPartnerIdCached({ conversationId, userId });

      // Remove from partner's enter set
      void presence.leaveChat({ userId, partnerId });

      if (partnerId) {
        // Auto-unsubscribe from partner's presence updates
        void socket.leave(`presence:${partnerId}`);

        io.to(`user:${partnerId}`).emit('partner_left_chat', { conversationId });
      }

      if (typeof ack === 'function') ack({ ok: true });
    } catch (err: unknown) {
      logger.error('[socket] leave_chat error', err);
      if (err instanceof Error && typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });



  // ─── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    try {
      // Single-device model: remove socket and clean up all enter sets
      await presence.removeSocket({ userId });
      await presence.removeFromAllEnterSets({ userId });
      socket.to(`presence:${userId}`).emit('partner_offline', { userId });
    } catch (err) {
      logger.error('[socket] disconnect cleanup error', err);
    }
  });
}
