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
 *   user_offline           { userId }                           → partner rooms
 *   missed_messages_available { conversationId, unreadCount }   → reconnecting user
 *   pong                                                       → requesting socket
 */

import { logger } from '../libs/winston.js';
import { chatService, conversationRepository } from '../state.js';
import prisma from '../libs/database.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { ConversationWithParticipantsAndMessages } from '../domain/conversation.entity.js';

/**
 * Emit an event to all partner rooms of a user across all their conversations.
 */
async function emitToPartners(
  io: import('socket.io').Server,
  userId: IDType,
  event: string,
  payload: Object
) {
  try {
    const convs = await conversationRepository.findNonEmptyConversationsWithParticipantsAndMessages(
      { userId, filter: 'All' }
    );
    const partnersEmitted = new Set();
    for (const conv of convs.conversationParticipantsWithMessages) {
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
 * @param {import('../generated/prisma/client.js').Conversation & { participants: import('../generated/prisma/client.js').ConversationParticipant[] }} conv
 */
function getPartnerId(
  conv: ConversationWithParticipantsAndMessages,
  myUserId: IDType
): string | undefined {
  return conv.participants.find((p) => p.userId !== myUserId)?.userId;
}

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
  socket.on('send_message', async ({ conversationId, content, type = 'TEXT' }, ack) => {
    try {
      // 1. DB-based participant validation (authoritative)
      await chatService.validateParticipant({ conversationId, userId });

      // 2. Fetch conversation to know the partner
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);

      // 3. Send the message (atomic counter increment + insert in tx)
      //    sendMessage also auto-updates sender's lastReceivedMessageNumber
      const message = await chatService.sendMessage({
        conversationId,
        senderId: userId,
        content,
        type,
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
          messageNumber: message.messageNumber,
          createdAt: message.createdAt,
          delivered,
          read: recipientInChat,
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
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);
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
      void presence.enterChat({ conversationId, userId, socketId: socket.id });

      // 3. Auto-mark all messages as read (also bumps lastReceivedMessageNumber)
      await chatService.markAllAsRead({ conversationId, userId });

      // 4. Notify partner — entered chat + their messages are now delivered
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);
      if (partnerId) {
        io.to(`user:${partnerId}`).emit('partner_entered_chat', { conversationId });

        // Tell partner their messages are delivered up to conversation's messageCounter
        io.to(`user:${partnerId}`).emit('messages_delivered', {
          conversationId,
          deliveredUpTo: conv.messageCounter,
        });
      }

      if (typeof ack === 'function') ack({ ok: true });
    } catch (err: unknown) {
      logger.error('[socket] enter_chat error', err);
      if (err instanceof Error && typeof ack === 'function') ack({ ok: false, error: err.message });
    }
  });

  // ─── leave_chat ─────────────────────────────────────────────────────────────
  socket.on('leave_chat', async ({ conversationId }, ack) => {
    try {
      // Remove only this socket from inChat set
      void presence.leaveChat({ conversationId, userId, socketId: socket.id });

      // Notify partner
      const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
      const partnerId = getPartnerId(conv, userId);
      if (partnerId) {
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
      // 1. Remove socket from online set
      void presence.removeSocket({ userId, socketId: socket.id });

      // 2. Remove socket from all inChat sets
      const convs =
        await conversationRepository.findNonEmptyConversationsWithParticipantsAndMessages({
          userId,
          filter: 'All',
        });
      const conversationIds = convs.conversationParticipantsWithMessages.map((c) => c.id);
      void presence.leaveAllChats({ userId, socketId: socket.id, conversationIds });

      // 3. Check if all devices are now offline
      const remaining = await presence.countSockets({ userId });

      if (remaining === 0) {
        // 4. Full cleanup — remove all presence keys to prevent leaks
        await Promise.all([
          presence.removeAllSockets({ userId }),
          presence.removeAllInChat({ userId, conversationIds }),
        ]);

        // 5. Persist availability state in DB
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false },
        });

        // 6. Emit user_offline to all partner rooms
        await emitToPartners(io, userId, 'user_offline', { userId });

        logger.info(`[socket] user ${userId} is now fully offline`);
      }
    } catch (err) {
      logger.error('[socket] disconnect cleanup error', err);
    }
  });
}
