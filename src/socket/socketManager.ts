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
import { createSocketRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import { registerSocketHandlers } from './socketHandlers.js';
import { initEmitter } from './socket-emitter.js';
import { chatService, rateLimitCache } from '../state.js';
import prisma from '../libs/database.js';
import AppError from 'src/errors/AppError.js';

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
      .catch((err) => {
        logger.warn('[socket] authentication failed', err);
        next(err instanceof AppError ? err : new AppError('Authentication failed', 401));
      });
  });

  // ─── Connection handler ──────────────────────────────────────────────────────
  io.on('connection', async (socket) => {
    const { userId } = socket.data;
    const presence = chatService.presence;

    logger.info(`[socket] connected: ${userId} (${socket.id})`);

    // ─── Global Rate Limiter (imported from rateLimitMiddleware) ─────────────
    socket.use(createSocketRateLimiter(rateLimitCache, userId));

    // 1. Join user room — all devices of this user share one room
    await socket.join(`user:${userId}`);

    try {
      // 2. Check if user is already online (before setting new socket)
      const isAlreadyOnline = await presence.isOnline({ userId });

      // 3. Register socket in Redis (single-device model overwrites previous)
      await presence.setSocket({ userId, socketId: socket.id });

      // 4. Mark user as available in DB and emit to presence room — only on transition to online
      if (!isAlreadyOnline) {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: true },
        });
        socket.to(`presence:${userId}`).emit('partner_online', { userId });
      }

      // 4. Single query: join conversation_participants with conversations
      //    to get unreceived/unread counts directly, avoiding N+1 loops
      const participantRows = await prisma.$queryRaw<
        Array<{
          conversationId: string;
          lastReceivedMessageNumber: number;
          lastReadMessageNumber: number;
          messageCounter: number;
        }>
      >`
        SELECT
  cp."conversationId",
  cp."lastReceivedMessageNumber",
  cp."lastReadMessageNumber",
  c."messageCounter",
  (c."messageCounter" - cp."lastReceivedMessageNumber") AS "missed"
FROM conversation_participants cp
JOIN conversations c ON c.id = cp."conversationId"
WHERE cp."userId" = ${userId}
  AND c."messageCounter" > cp."lastReceivedMessageNumber"
        `;

      if (participantRows.length > 0) {
        socket.emit('missed_messages_available', participantRows);
      }
    } catch (err) {
      logger.error('[socket] onConnection initialization error', err);
    }

    // 8. Register all event handlers for this socket
    registerSocketHandlers(io, socket);
  });

  logger.info('✅ Socket.IO server initialized');
  return io;
}
