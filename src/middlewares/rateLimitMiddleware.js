/**
 * @fileoverview Rate Limit Middleware - Rate limiting for API endpoints
 * @module middlewares/rateLimitMiddleware
 */

import rateLimit from "express-rate-limit";
import { rateLimitService } from "../state.js";
import AppError from "../errors/AppError.js";
import environment from "../configs/environment.js";
import { asyncHandler } from "../types/asyncHandler.js";


// ─── OTP Middlewares ─────────────────────────────────────────────────────────

/**
 * Middleware: check OTP send rate limit (phone + device).
 * Controller must call rateLimitService.incrementSend() after sending.
 */
export const checkSendOtpLimit = asyncHandler(async (req, _, next) => {
  try {

    const phone    = req.body.phoneNumber;
    const method   = req.body.method;
    const deviceId = req.deviceId;

    if (!phone)    return next(new AppError("Phone number is required", 422));
    if (!deviceId) return next(new AppError("X-Device-Fingerprint header is required", 422));

    if (environment.nodeEnv !== "development") await rateLimitService.checkSendOtp(phone, method, deviceId);
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
    const phone  = req.body.phoneNumber;
    const method = req.body.method;

    if (!phone) return next(new AppError("Phone number is required", 422));

    if (environment.nodeEnv !== "development") await rateLimitService.checkVerify(phone, method);
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
export const ipRateLimiter = environment.nodeEnv === "development" ? asyncHandler((_, __, next) => next()) : rateLimit({
  windowMs:        environment.rateLimit.windowMs ?? 15 * 60 * 1000,
  limit:           environment.rateLimit.max      ?? 100,
  standardHeaders: "draft-7", // RateLimit headers (RFC 9110)
  legacyHeaders:   false,
  handler: (_, __, next) => {
    next(new AppError("Too many requests, please try again later", 429));
  },
});

/**
 * Stricter IP rate limiter for sensitive routes (auth, OTP, etc.)
 * Configured via environment variables:
 *   RATE_LIMIT_SENSITIVE_WINDOW_MS  (default: 15 minutes)
 *   RATE_LIMIT_SENSITIVE_MAX        (default: 10 requests)
 */
export const sensitiveIpRateLimiter = environment.nodeEnv === "development" ? asyncHandler((_, __, next) => next()) : rateLimit({
  windowMs:        environment.rateLimit.sensitiveWindowMs ?? 15 * 60 * 1000,
  limit:           environment.rateLimit.sensitiveMax      ?? 10,
  standardHeaders: "draft-7",
  legacyHeaders:   false,
  handler: (_, __, next) => {
    next(new AppError("Too many requests on this endpoint, please try again later", 429));
  },
});
