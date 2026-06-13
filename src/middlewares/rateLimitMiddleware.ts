/**
 * @fileoverview Rate Limit Middleware - Rate limiting for API endpoints
 * @module middlewares/rateLimitMiddleware
 */

import { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { rateLimitService } from '../state.js';
import AppError from '../errors/AppError.js';
import environment from '../configs/environment.js';
import { asyncHandler } from '../types/asyncHandler.js';

// ─── OTP Middlewares ─────────────────────────────────────────────────────────

/**
 * Middleware: check OTP send rate limit (phone + device).
 * Controller must call rateLimitService.incrementSend() after sending.
 */
export const checkSendOtpLimit = asyncHandler(async (req, _, next) => {
  try {
    const phone = req.body.phoneNumber;
    const method = req.body.method;
    const deviceId = req.deviceId;

    if (!phone) return next(new AppError('Phone number is required', 422));
    if (!deviceId) return next(new AppError('X-Device-Fingerprint header is required', 422));

    if (environment.nodeEnv !== 'development')
      await rateLimitService.checkSendOtp(phone, method, deviceId);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Middleware: check OTP verify attempt limit (per phone).
 * Controller must call rateLimitService.incrementVerify() on wrong attempt.
 */
export const checkVerifyLimit = asyncHandler(async (req, _, next) => {
  try {
    const phone = req.body.phoneNumber;
    const method = req.body.method;

    if (!phone) return next(new AppError('Phone number is required', 422));

    if (environment.nodeEnv !== 'development') await rateLimitService.checkVerify(phone, method);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── IP Rate Limiter (express-rate-limit) ────────────────────────────────────

/**
 * General IP-based rate limiter using express-rate-limit.
 * Configured via environment variables:
 *   RATE_LIMIT_WINDOW_MS  (default: 15 minutes)
 *   RATE_LIMIT_MAX        (default: 100 requests)
 */
export const ipRateLimiter: RequestHandler =
  environment.nodeEnv === 'development'
    ? (req, res, next) => { next(); }
    : rateLimit({
        windowMs: environment.rateLimit.windowMs ?? 15 * 60 * 1000,
        limit: environment.rateLimit.max ?? 100,
        standardHeaders: 'draft-7', // RateLimit headers (RFC 9110)
        legacyHeaders: false,
        handler: (_, __, next) => {
          next(new AppError('Too many requests, please try again later', 429));
        },
      });

/**
 * Stricter IP rate limiter for sensitive routes (auth, OTP, etc.)
 * Configured via environment variables:
 *   RATE_LIMIT_SENSITIVE_WINDOW_MS  (default: 15 minutes)
 *   RATE_LIMIT_SENSITIVE_MAX        (default: 10 requests)
 */
export const sensitiveIpRateLimiter: RequestHandler =
  environment.nodeEnv === 'development'
    ? (req, res, next) => { next(); }
    : rateLimit({
        windowMs: environment.rateLimit.sensitiveWindowMs ?? 15 * 60 * 1000,
        limit: environment.rateLimit.sensitiveMax ?? 10,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: (_, __, next) => {
          next(new AppError('Too many requests on this endpoint, please try again later', 429));
        },
      });

// ─── Socket Rate Limiter (per-event, per-user) ──────────────────────────────

import type { Event } from 'socket.io';
import type IRateLimitCache from '../cache/interfaces/RateLimitCache.js';
import { logger } from '../libs/winston.js';

/**
 * Creates a Socket.IO packet-level rate-limiter middleware.
 * Attach with `socket.use(createSocketRateLimiter(cache, userId))`.
 */
export function createSocketRateLimiter(
  rateLimitCache: IRateLimitCache,
  userId: string,
): (event: Event, next: (err?: Error) => void) => void {
  return (async ([event, ...args]: Event, next: (err?: Error) => void) => {
    if (typeof event !== 'string' || event === 'disconnect') return next();

    let limit = 60; // Default for high-frequency (typing_indicator, ping)
    if (event === 'send_message') limit = 30;
    else if (['read'].includes(event)) limit = 20;
    else if (['enter_chat', 'leave_chat', 'typing_indicator', 'ping'].includes(event))
      return next();
    try {
      await rateLimitCache.consumeSocketEvent(userId, event, limit, 60);
      next();
    } catch (err: unknown) {
      if (
        !(err instanceof Error) ||
        !('msBeforeNext' in err && typeof err.msBeforeNext === 'number')
      ) {
        logger.error('[socket] rate limit error', err);
        return next(new Error('Rate limit exceeded'));
      }
      const retryAfter = err.msBeforeNext ? Math.round(err.msBeforeNext / 1000) : 60;

      // TODO: Implement block/ban logic here for severe abusers if needed

      const lastArg = args[args.length - 1];
      if (typeof lastArg === 'function') {
        lastArg({ ok: false, error: 'Rate limit exceeded', retryAfter });
      } else {
        // `socket` is not in scope here — caller should handle this via
        // the Error passed to next(), or attach a listener for 'error'.
        return next(new Error(`Rate limit exceeded|${JSON.stringify({ event, retryAfter })}`));
      }
      // Do not call next() -> packet is silently dropped
    }
  }) as (event: Event, next: (err?: Error) => void) => void;
}
