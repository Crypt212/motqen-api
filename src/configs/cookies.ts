/**
 * @fileoverview Cookie Configuration - Secure cookie settings for admin web application
 * @module configs/cookies
 */

import { CookieOptions } from 'express';
import environment from './environment.js';

const isProduction = environment.nodeEnv === 'production';

/**
 * Base secure cookie options shared across all admin cookies.
 * httpOnly prevents XSS access, secure ensures HTTPS-only in production,
 * sameSite 'strict' prevents CSRF via cross-origin form submissions.
 */
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  path: '/',
};

/**
 * Cookie configuration for admin authentication tokens.
 */
export const adminCookieConfig = {
  /** Access token cookie — short-lived, sent on all admin API requests */
  accessToken: {
    name: 'admin_access_token',
    options: {
      ...baseCookieOptions,
      maxAge: parseDurationToMs(environment.jwt.access.expiresIn),
      path: '/api/v1/admin',
    } satisfies CookieOptions,
  },

  /** Refresh token cookie — long-lived, only sent to the refresh endpoint */
  refreshToken: {
    name: 'admin_refresh_token',
    options: {
      ...baseCookieOptions,
      maxAge: parseDurationToMs(environment.jwt.refresh.expiresIn),
      path: '/api/v1/admin/auth',
    } satisfies CookieOptions,
  },

  /** CSRF token cookie — readable by JavaScript (not httpOnly) for double-submit pattern */
  csrfToken: {
    name: 'admin_csrf_token',
    options: {
      ...baseCookieOptions,
      httpOnly: false, // Must be readable by frontend JS to include in headers
      maxAge: parseDurationToMs(environment.jwt.access.expiresIn),
      path: '/api/v1/admin',
    } satisfies CookieOptions,
  },
} as const;

/** Header name the frontend must use to submit the CSRF token */
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Cookie names to clear on logout (used to build clearCookie calls).
 */
export const ADMIN_COOKIE_NAMES = [
  adminCookieConfig.accessToken.name,
  adminCookieConfig.refreshToken.name,
  adminCookieConfig.csrfToken.name,
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a duration string (e.g. '24h', '7d', '30m') to milliseconds.
 * Falls back to 24 hours if the format is not recognized.
 */
function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // default 24h

  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}
