import { Router } from 'express';
import { validateBody } from '../../../middlewares/validateRequest.js';
import {
  authenticateAdminAccess,
  authenticateAdminRefresh,
} from '../../../middlewares/adminAuthMiddleware.js';
import { login, logout, refreshAccessToken } from '../../../controllers/AdminAuthController.js';
import { AdminLoginSchema } from '../../../schemas/requests/admin-auth.request.js';
import { sensitiveIpRateLimiter } from '../../../middlewares/rateLimitMiddleware.js';

const adminAuthRouter: Router = Router();

// Login — rate-limited to prevent brute force, no device fingerprint required for web
adminAuthRouter.post('/login', sensitiveIpRateLimiter, validateBody(AdminLoginSchema), login);

// Logout — requires valid access token (from cookie or header)
adminAuthRouter.post('/logout', authenticateAdminAccess, logout);

// Refresh — uses refresh token from cookie, issues new access token as cookie
adminAuthRouter.get('/access', authenticateAdminRefresh, refreshAccessToken);

export default adminAuthRouter;
