import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { verifyAndDecodeToken } from '../utils/tokens.js';
import { AdminAccessTokenPayload, AdminRefreshTokenPayload } from '../types/tokens.js';
import { redisRetreiveOrCache } from '../utils/redis.js';
import { adminRepository } from '../state.js';
import { adminCookieConfig } from '../configs/cookies.js';

/**
 * Extract the access token from the httpOnly cookie.
 * Falls back to Authorization header for backward compatibility with mobile clients.
 */
function extractAccessToken(req: import('../types/asyncHandler.js').Request): string | null {
  // Priority 1: httpOnly cookie (web app)
  const cookieToken = req.cookies?.[adminCookieConfig.accessToken.name];
  if (cookieToken) return cookieToken;

  // Priority 2: Authorization header (mobile/API clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}

/**
 * Extract the refresh token from the httpOnly cookie.
 * Falls back to Authorization header for backward compatibility with mobile clients.
 */
function extractRefreshToken(req: import('../types/asyncHandler.js').Request): string | null {
  // Priority 1: httpOnly cookie (web app)
  const cookieToken = req.cookies?.[adminCookieConfig.refreshToken.name];
  if (cookieToken) return cookieToken;

  // Priority 2: Authorization header (mobile/API clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}

export const authenticateAdminAccess = asyncHandler(async (req, _, next) => {
  const token = extractAccessToken(req);
  if (!token) {
    next(new AppError('Unauthorized admin access', 401));
    return;
  }

  let payload: AdminAccessTokenPayload;
  try {
    payload = verifyAndDecodeToken(token, 'access') as AdminAccessTokenPayload;
  } catch {
    next(new AppError('Unauthorized admin access', 401));
    return;
  }

  if (!payload || payload.domain !== 'admin') {
    next(new AppError('Unauthorized admin access', 401));
    return;
  }

  const liveAdmin = await redisRetreiveOrCache(`admin:${payload.adminId}`, async () => {
    return adminRepository.find({ filter: { id: payload.adminId } });
  });

  if (!liveAdmin || liveAdmin.status !== 'ACTIVE') {
    next(new AppError('Admin account disabled or not found', 403));
    return;
  }

  // Override JWT role with live role from database
  payload.role = liveAdmin.role;
  req.adminState = payload;
  next();
});

export const authenticateAdminRefresh = asyncHandler(async (req, _, next) => {
  const token = extractRefreshToken(req);
  if (!token) {
    next(new AppError('Unauthorized admin refresh access', 401));
    return;
  }

  let payload: AdminRefreshTokenPayload;
  try {
    payload = verifyAndDecodeToken(token, 'refresh') as AdminRefreshTokenPayload;
  } catch {
    next(new AppError('Unauthorized admin refresh access', 401));
    return;
  }

  if (!payload || payload.domain !== 'admin') {
    next(new AppError('Unauthorized admin refresh access', 401));
    return;
  }

  req.adminState = payload;
  next();
});

export const authorizeAdminRole = (expectedRole: string) =>
  asyncHandler(async (req, _, next) => {
    if (!req.adminState) {
      next(new AppError('Forbidden', 403));
      return;
    }
    if (req.adminState.role !== 'SUPER_ADMIN' && req.adminState.role !== expectedRole) {
      next(new AppError('Forbidden', 403));
      return;
    }
    next();
  });

export const requireAdminPermission = (allowedRoles: string[]) =>
  asyncHandler(async (req, _, next) => {
    if (!req.adminState) {
      next(new AppError('Forbidden', 403));
      return;
    }
    const role = req.adminState.role;
    if (role !== 'SUPER_ADMIN' && !allowedRoles.includes(role)) {
      next(new AppError('Forbidden', 403));
      return;
    }
    next();
  });
