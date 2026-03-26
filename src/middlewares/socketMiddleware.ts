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
import AppError from '../errors/AppError.js';
import { ExtendedError, Socket } from 'socket.io';
import { AccessTokenPayload } from 'src/types/tokens.js';

/**
 * Socket.IO middleware that authenticates the connection via JWT access token.
 * The token must be passed in socket.handshake.auth.token.
 *
 * On success, attaches to socket.data:
 *   - userId      {string}
 *   - userState   {object}  — same shape as req.userState in HTTP middleware
 */
export const socketAuth = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new AppError('Unauthorized, handshake token is not found', 401));
  }
  // Reuse the same verifyAndDecodeToken utility used by HTTP middleware
  let payload: AccessTokenPayload;
  try {
    payload = verifyAndDecodeToken(token, 'access');
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }

  // Load user state from Redis cache (same pattern as authenticateAccess)
  const userState = await redisRetreiveOrCache(`access:${payload.userId}`, async () =>
    userService.getStatus({ filter: { id: payload.userId } })
  );

  if (!userState) {
    return next(new AppError('Not authenticated', 401));
  }

  if (userState.accountStatus !== 'ACTIVE') {
    return next(new AppError('Unauthorized access for users with no active account', 403));
  }

  // Attach to socket for use in all handlers
  socket.data.userId = payload.userId;
  socket.data.userState = userState;

  next();
};
