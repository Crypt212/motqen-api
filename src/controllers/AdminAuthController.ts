import { asyncHandler } from '../types/asyncHandler.js';
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { adminAuditLogService, adminAuthService } from '../state.js';
import { AdminAuditActions } from '../services/AdminAuditLogService.js';
import { adminCookieConfig, ADMIN_COOKIE_NAMES } from '../configs/cookies.js';
import { generateCsrfToken } from '../middlewares/csrfMiddleware.js';

const getUserAgent = (value: string | string[] | undefined): string | null =>
  Array.isArray(value) ? value.join(', ') : value ?? null;

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  let admin;
  try {
    admin = await adminAuthService.validateLogin(username, password);
  } catch (error) {
    await adminAuditLogService.record({
      action: AdminAuditActions.ADMIN_LOGIN_FAILED,
      category: 'AUTH',
      severity: 'WARNING',
      metadata: { attemptedUsername: username },
      ipAddress: req.ip ?? null,
      userAgent: getUserAgent(req.headers['user-agent']),
    });
    throw error;
  }

  const tokens = await adminAuthService.createSession(admin);

  // Set httpOnly secure cookies for both tokens
  res.cookie(
    adminCookieConfig.accessToken.name,
    tokens.accessToken,
    adminCookieConfig.accessToken.options
  );
  res.cookie(
    adminCookieConfig.refreshToken.name,
    tokens.refreshToken,
    adminCookieConfig.refreshToken.options
  );

  // Set CSRF token as a readable cookie for double-submit pattern
  const csrfToken = generateCsrfToken();
  res.cookie(
    adminCookieConfig.csrfToken.name,
    csrfToken,
    adminCookieConfig.csrfToken.options
  );

  await adminAuditLogService.record({
    actor: {
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    },
    action: AdminAuditActions.ADMIN_LOGIN_SUCCESS,
    category: 'AUTH',
    severity: 'INFO',
    targetType: 'Admin',
    targetId: admin.id,
    ipAddress: req.ip ?? null,
    userAgent: getUserAgent(req.headers['user-agent']),
  });

  // Only return admin profile data — tokens are in cookies, not in the body
  new SuccessResponse('Admin login successful', {
    admin: {
      id: admin.id,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      profileImageUrl: admin.profileImageUrl,
      role: admin.role,
      status: admin.status,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    },
  }).send(res);
});

export const logout = asyncHandler(async (req, res) => {
  await adminAuthService.revokeSessionsForAdmin(
    req.adminState?.adminId ?? 'system',
    req.adminState?.adminId ?? 'system'
  );

  // Clear all admin cookies on logout
  for (const name of ADMIN_COOKIE_NAMES) {
    res.clearCookie(name, { path: '/api/v1/admin' });
  }

  await adminAuditLogService.record({
    actor: adminAuditLogService.actorFromAdminState(req.adminState),
    action: AdminAuditActions.ADMIN_LOGOUT,
    category: 'AUTH',
    severity: 'INFO',
    targetType: 'Admin',
    targetId: req.adminState?.adminId ?? null,
    ipAddress: req.ip ?? null,
    userAgent: getUserAgent(req.headers['user-agent']),
  });
  new SuccessResponse('Admin logout successful', null).send(res);
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  // Refresh token is extracted from cookie by the authenticateAdminRefresh middleware
  const refreshToken =
    req.cookies?.[adminCookieConfig.refreshToken.name] ??
    req.headers.authorization?.replace('Bearer ', '');

  if (!refreshToken) {
    throw new AppError('Missing refresh token', 401);
  }

  const accessToken = await adminAuthService.refreshAccessToken(refreshToken);

  // Set the new access token in httpOnly cookie
  res.cookie(
    adminCookieConfig.accessToken.name,
    accessToken,
    adminCookieConfig.accessToken.options
  );

  // Rotate the CSRF token on refresh for extra security
  const csrfToken = generateCsrfToken();
  res.cookie(
    adminCookieConfig.csrfToken.name,
    csrfToken,
    adminCookieConfig.csrfToken.options
  );

  new SuccessResponse('New access token issued', null).send(res);
});
