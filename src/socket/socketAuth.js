/**
 * @fileoverview socketAuth - Socket.IO authentication middleware
 * @module socket/socketAuth
 *
 * Reuses the same JWT verification logic as the HTTP authenticateAccess middleware.
 * Runs before any event handler — unauthenticated sockets are disconnected immediately.
 */

import { verifyAndDecodeToken } from '../utils/tokens.js';
import { redisRetreiveOrCache } from '../utils/redis.js';
import { userService } from '../state.js';

/**
 * Socket.IO middleware that authenticates the connection via JWT access token.
 * The token must be passed in socket.handshake.auth.token.
 *
 * On success, attaches to socket.data:
 *   - userId      {string}
 *   - userState   {object}  — same shape as req.userState in HTTP middleware
 *
 * @param {import('socket.io').Socket} socket
 * @param {function} next
 */
export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required: no token provided'));
    }
    // Reuse the same verifyAndDecodeToken utility used by HTTP middleware
    let payload;
    try {
      payload = verifyAndDecodeToken(token, 'access');
    } catch {
      return next(new Error('Authentication failed: invalid or expired token'));
    }

    // Load user state from Redis cache (same pattern as authenticateAccess)
    const userState = await redisRetreiveOrCache(
      `access:${payload.userId}`,
      async () => userService.getStatus({ userId: payload.userId }),
    );

    if (!userState) {
      return next(new Error('Authentication failed: user not found'));
    }

    if (userState.accountStatus !== 'ACTIVE') {
      return next(new Error('Authentication failed: account is not active'));
    }

    // Attach to socket for use in all handlers
    socket.data.userId = payload.userId;
    socket.data.userState = userState;

    next();
  } catch (err) {
    next(new Error(`Authentication error: ${err.message}`));
  }
};
