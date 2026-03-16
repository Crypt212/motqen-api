/**
 * @fileoverview socketManager - Socket.IO initialization and lifecycle management
 * @module socket/socketManager
 *
 * Sets up:
 *   - Socket.IO server with Redis adapter (multi-node ready from day 1)
 *   - Authentication middleware
 *   - onConnection handler (online tracking + event registration)
 */

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import environment from '../configs/environment.js';
import { logger } from '../libs/winston.js';
import { socketAuth } from '../middlewares/socketMiddleware.js';
import { registerSocketHandlers } from './socketHandlers.js';
import { chatService, conversationRepository } from '../state.js';
import prisma from '../libs/database.js';

/**
 * Initialize the Socket.IO server and attach it to the HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {Promise<import('socket.io').Server>}
 */
export async function initSocketServer(httpServer) {
  // ─── Create Socket.IO server ────────────────────────────────────────────────
  const io = new Server(httpServer, {
    // Recommended: only use WebSocket transport after upgrade to avoid
    // sticky-session requirements when scaling
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ─── Redis Adapter (multi-node pub/sub) ─────────────────────────────────────
  // Use two separate Redis clients as required by the adapter
  const pubClient = createClient({ url: environment.redis.url });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('✅ Socket.IO Redis adapter connected');

  // ─── Auth middleware (runs before every connection) ──────────────────────────
  io.use(socketAuth);

  // ─── Connection handler ──────────────────────────────────────────────────────
  io.on('connection', async (socket) => {
    const { userId } = socket.data;
    const presence = chatService.presence;

    logger.info(`[socket] connected: ${userId} (${socket.id})`);

    // 1. Join user room — all devices of this user share one room
    socket.join(`user:${userId}`);

    // 2. Register socket in Redis presence Set
    await presence.addSocket({ userId, socketId: socket.id });

    // 3. Mark user as available in DB
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });

      const convs = await conversationRepository.findAllByUserId({ userId });

      // 4. Mark all pending messages as delivered & notify senders
      //    Coming online = all messages in every conversation are now delivered
      for (const conv of convs) {
        if (conv.messageCounter > 0) {
          // Update this user's lastReceivedMessageNumber
          await chatService.markAsDelivered({
            conversationId: conv.id,
            userId,
            messageNumber: conv.messageCounter,
          });

          // Notify the partner that their messages were delivered
          const partner = conv.participants.find((p) => p.userId !== userId);
          if (partner) {
            io.to(`user:${partner.userId}`).emit('messages_delivered', {
              conversationId: conv.id,
              deliveredUpTo: conv.messageCounter,
            });
          }
        }
      }

      // 5. Emit missed_messages_available for each conversation with unread messages
      //    Client will pull missed messages via HTTP after receiving this event.
      for (const conv of convs) {
        const myParticipant = conv.participants.find((p) => p.userId === userId);
        const unreadCount = conv.messageCounter - (myParticipant?.lastReadMessageNumber ?? 0);
        if (unreadCount > 0) {
          socket.emit('missed_messages_available', {
            conversationId: conv.id,
            unreadCount,
          });
        }
      }
    } catch (err) {
      logger.error('[socket] onConnection initialization error', err);
    }

    // 5. Register all event handlers for this socket
    registerSocketHandlers(io, socket);
  });

  logger.info('✅ Socket.IO server initialized');
  return io;
}
