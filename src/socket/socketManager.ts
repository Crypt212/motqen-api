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
import { initEmitter } from './socket-emitter.js';
import { chatService, conversationRepository, rateLimitCache } from '../state.js';
import prisma from '../libs/database.js';

/** Initialize the Socket.IO server and attach it to the HTTP server. */
export async function initSocketServer(httpServer: import('http').Server): Promise<Server> {
  // ─── Create Socket.IO server ────────────────────────────────────────────────
  const io = new Server(httpServer, {
    // Recommended: only use WebSocket transport after upgrade to avoid
    // sticky-session requirements when scaling
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  initEmitter(io);

  // ─── Redis Adapter (multi-node pub/sub) ─────────────────────────────────────
  // Use two separate Redis clients as required by the adapter
  const pubClient = createClient({ url: environment.redis.url });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('✅ Socket.IO Redis adapter connected');

  // ─── Auth middleware (runs before every connection) ──────────────────────────
  io.use((socket, next) => {
    socketAuth(socket, next)
      .then(() => logger.info(`[socket] authenticated: ${socket.data.userId}`))
      .catch(() => logger.warn('[socket] authentication failed'));
  });

  // ─── Connection handler ──────────────────────────────────────────────────────
  io.on('connection', async (socket) => {
    const { userId } = socket.data;
    const presence = chatService.presence;

    logger.info(`[socket] connected: ${userId} (${socket.id})`);

    // ─── Global Rate Limiter ───────────────────────────────────────────────────
    socket.use(async ([event, ...args], next) => {
      if (typeof event !== 'string' || event === 'disconnect') return next();

      let limit = 60; // Default for high-frequency (typing_indicator, ping)
      if (event === 'send_message') limit = 30;
      else if (['read'].includes(event)) limit = 20;
      else if (['enter_chat', 'leave_chat' , 'typing_indicator' ,'ping' ].includes(event)) return next();
      try {
        await rateLimitCache.consumeSocketEvent(userId, event, limit, 60);
        next();
      } catch (err: any) {
        const retryAfter = err.msBeforeNext ? Math.round(err.msBeforeNext / 1000) : 60;
        
        // TODO: Implement block/ban logic here for severe abusers if needed 

        const lastArg = args[args.length - 1];
        if (typeof lastArg === 'function') {
          lastArg({ ok: false, error: 'Rate limit exceeded', retryAfter });
        } else {
          socket.emit('rate_limit_exceeded', { event, retryAfter });
        }
        // Do not call next() -> packet is silently dropped
      }
    });

    // 1. Join user room — all devices of this user share one room
    await socket.join(`user:${userId}`);

    // 2. Register socket in Redis presence Set
    const addSocketPromise = presence.addSocket({ userId, socketId: socket.id });

    // 3. Mark user as available in DB
    await addSocketPromise;
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });

      const convs =
        await conversationRepository.findNonEmptyConversationsWithParticipantsAndMessages({
          userId,
          filter: {},
        });

      // 4. Mark all pending messages as delivered & notify senders
      //    Coming online = all messages in every conversation are now delivered
      for (const conv of convs.conversationParticipantsWithMessages) {
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
      for (const conv of convs.conversationParticipantsWithMessages) {
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
