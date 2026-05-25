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
import { chatPresenceCache } from '../state.js';

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
  socket.on('ping', async () => {
    void presence.refreshPresence({ userId });
    socket.emit('pong');
  });

  // ─── send_message ───────────────────────────────────────────────────────────
  socket.on('send_message', async ({ conversationId, content, type = 'TEXT', localId }, ack) => {
    console.log(userId);
    try {
      if (type !== 'TEXT') {
        if (typeof ack === 'function') {
          ack({ ok: false, error: 'Invalid message type' });
        }
        return;
      }

      // 1. DB-based participant validation (authoritative)
      await chatService.validateParticipant({ conversationId, userId });

      // 2. Fetch partner ID efficiently
      const partnerId = await conversationRepository.findPartnerId({ conversationId, userId });

      // 3. Send the message (atomic counter increment + insert in tx)
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

      // 4. Check recipient presence
      const [delivered, recipientInChat] = await Promise.all([
        presence.isOnline({ userId: partnerId }),
        presence.isInChat({ conversationId, userId: partnerId }),
      ]);

      // 5. If recipient is online → mark as delivered in DB
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

      // 6. If recipient is inside this chat → auto-mark as read immediately
      if (recipientInChat) {
        await chatService.markAllAsRead({ conversationId, userId: partnerId });
      }

      // 7. Emit new_message to recipient
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('new_message', { message, conversationId });
      }

      // 8. ACK sender with delivery + read status
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
      // 1. DB-based participant validation
      await chatService.validateParticipant({ conversationId, userId });

      // 2. Mark as read (validates message belongs to this conversation)
      const { readUpTo } = await chatService.markAsRead({ conversationId, userId, lastMessageId });

      // 3. Notify partner
      const partnerId = await conversationRepository.findPartnerId({ conversationId, userId });
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
      // Light Redis check (soft auth — low risk event, no DB write)
      const inChat = await presence.isInChat({ conversationId, userId });
      if (!inChat) return; // silently ignore if not in chat

      if (isTyping) {
        void presence.setTyping({ conversationId, userId });
      } else {
        void presence.clearTyping({ conversationId, userId });
      }

      // Emit to partner only
      const partnerId = await conversationRepository.findPartnerId({ conversationId, userId });
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
      // 1. DB-based participant validation
      await chatService.validateParticipant({ conversationId, userId });

      // 2. Track per-socket inChat (multi-device safe)
      void presence.enterChat({ conversationId, userId });

      // 3. Auto-mark all messages as read (also bumps lastReceivedMessageNumber)
      await chatService.markAllAsRead({ conversationId, userId });

      let isPartnerOnline = false;

      // 4. Notify partner — entered chat + their messages are now delivered
      const partnerId = await conversationRepository.findPartnerId({ conversationId, userId });

      if (partnerId) {
        isPartnerOnline = await presence.isOnline({ userId: partnerId });
        
        // Auto-subscribe to partner's online/offline presence updates
        void socket.join(`presence:${partnerId}`);
        
        io.to(`user:${partnerId}`).emit('partner_entered_chat', { conversationId });

        // Tell partner their messages are delivered (up to their own messageCounter)
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
      // Remove from inChat set
      void presence.leaveChat({ conversationId, userId });

      // Notify partner
      const partnerId = await conversationRepository.findPartnerId({ conversationId, userId });
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
      let numSockets = await chatPresenceCache.removeSocket({ userId, socketId: socket.id });
      if (numSockets === 0) {
        // Full cleanup: Remove from all active chat rooms
        await chatPresenceCache.removeAllInChat({ userId });
        socket.to(`presence:${userId}`).emit('partner_offline', { userId });
      }
    } catch (err) {
      logger.error('[socket] disconnect cleanup error', err);
    }
  });
}
