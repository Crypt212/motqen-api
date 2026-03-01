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
 *   typing                 { conversationId, userId, isTyping } → partner room
 *   partner_entered_chat   { conversationId }                   → partner room
 *   partner_left_chat      { conversationId }                   → partner room
 *   user_online            { userId }                           → partner rooms
 *   user_offline           { userId, lastSeenAt }               → partner rooms
 *   missed_messages_available { conversationId, unreadCount }   → reconnecting user
 */

import { logger } from '../libs/winston.js';
import { chatService, conversationRepository } from '../state.js';
import prisma from '../libs/database.js';

/**
 * Emit an event to all partner rooms of a user across all their conversations.
 * @param {import('socket.io').Server} io
 * @param {string} userId
 * @param {string} event
 * @param {object} payload
 */
async function emitToPartners(io, userId, event, payload) {
  try {
    const convs = await conversationRepository.findAllByUserId({ userId });
    const partnersEmitted = new Set();
    for (const conv of convs) {
      const partner = conv.participants.find((p) => p.userId !== userId);
      if (partner && !partnersEmitted.has(partner.userId)) {
        io.to(`user:${partner.userId}`).emit(event, payload);
        partnersEmitted.add(partner.userId);
      }
    }
  } catch (err) {
    logger.error('[socket] emitToPartners error', err);
  }
}

/**
 * Get the partner userId inside a conversation.
 * @param {import('@prisma/client').Conversation & { participants: import('@prisma/client').ConversationParticipant[] }} conv
 * @param {string} myUserId
 * @returns {string | undefined}
 */
function getPartnerId(conv, myUserId) {
  return conv.participants.find((p) => p.userId !== myUserId)?.userId;
}

/**
 * Register all event handlers for a connected socket.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function registerSocketHandlers(io, socket) {
  const { userId } = socket.data;
  const presence = chatService.presence;

  // ─── send_message ───────────────────────────────────────────────────────────
  socket.on('send_message', async ({ conversationId, content, type = 'TEXT' }, ack) => {
    try {
      // 1. DB-based participant validation (authoritative)
      const participant = await chatService.validateParticipant({ conversationId, userId });

      // 2. Fetch conversation to know the partner
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);

      // 3. Send the message (atomic counter increment + insert in tx)
      const message = await chatService.sendMessage({ conversationId, senderId: userId, content, type });

      // 4. Check recipient presence
      const [delivered, recipientInChat] = await Promise.all([
        presence.isOnline({ userId: partnerId }),
        presence.isInChat({ conversationId, userId: partnerId }),
      ]);

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
          messageNumber: message.messageNumber,
          createdAt: message.createdAt,
          delivered,
          read: recipientInChat,
        });
      }
    } catch (err) {
      logger.error('[socket] send_message error', err);
      if (typeof ack === 'function') ack({ ok: false, error: err.message });
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
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('messages_read', { conversationId, readUpTo });
      }

      if (typeof ack === 'function') ack({ ok: true, readUpTo });
    } catch (err) {
      logger.error('[socket] read error', err);
      if (typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });

  // ─── typing_indicator ───────────────────────────────────────────────────────
  socket.on('typing_indicator', async ({ conversationId, isTyping }) => {
    try {
      // Light Redis check (soft auth — low risk event, no DB write)
      const inChat = await presence.isInChat({ conversationId, userId });
      if (!inChat) return; // silently ignore if not in chat

      if (isTyping) {
        await presence.setTyping({ conversationId, userId });
      } else {
        await presence.clearTyping({ conversationId, userId });
      }

      // Emit to partner only
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);
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
      await presence.enterChat({ conversationId, userId, socketId: socket.id });

      // 3. Auto-mark all messages as read
      await chatService.markAllAsRead({ conversationId, userId });

      // 4. Notify partner
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('partner_entered_chat', { conversationId });
      }

      if (typeof ack === 'function') ack({ ok: true });
    } catch (err) {
      logger.error('[socket] enter_chat error', err);
      if (typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });

  // ─── leave_chat ─────────────────────────────────────────────────────────────
  socket.on('leave_chat', async ({ conversationId }, ack) => {
    try {
      // Remove only this socket from inChat set
      await presence.leaveChat({ conversationId, userId, socketId: socket.id });

      // Notify partner
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('partner_left_chat', { conversationId });
      }

      if (typeof ack === 'function') ack({ ok: true });
    } catch (err) {
      logger.error('[socket] leave_chat error', err);
      if (typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });

  // ─── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    try {
      // 1. Remove socket from online set
      await presence.removeSocket({ userId, socketId: socket.id });

      // 2. Remove socket from all inChat sets
      const convs = await conversationRepository.findAllByUserId({ userId });
      const conversationIds = convs.map((c) => c.id);
      await presence.leaveAllChats({ userId, socketId: socket.id, conversationIds });

      // 3. Check if all devices are now offline
      const remaining = await presence.countSockets({ userId });

      if (remaining === 0) {
        // 4. Persist lastSeenAt on the User row — single write, zero amplification
        const lastSeenAt = new Date();
        await prisma.user.update({
          where: { id: userId },
          data: { lastSeenAt },
        });

        // 5. Emit user_offline to all partner rooms
        await emitToPartners(io, userId, 'user_offline', { userId, lastSeenAt });

        logger.info(`[socket] user ${userId} is now fully offline`);
      }
    } catch (err) {
      logger.error('[socket] disconnect cleanup error', err);
    }
  });
}
