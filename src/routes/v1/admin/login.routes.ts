/**
 * Admin panel login (MOTQEN-Dashboard) — separate from mobile OTP /auth/login.
 * POST /api/v1/admin/auth/login
 */
import { Router } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../../../types/asyncHandler.js';
import { validateBody } from '../../../middlewares/validateRequest.js';
import { AdminPanelLoginBodySchema } from '../../../schemas/adminPanel.js';
import environment from '../../../configs/environment.js';
import AppError from '../../../errors/AppError.js';
import SuccessResponse from '../../../responses/successResponse.js';
import { authService, userRepository } from '../../../state.js';

const router = Router();

function verifyPasswordSha256(plain: string, expectedHex: string): boolean {
  const digest = crypto.createHash('sha256').update(plain, 'utf8').digest('hex').toLowerCase();
  const exp = expectedHex.toLowerCase();
  if (digest.length !== exp.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, 'utf8'), Buffer.from(exp, 'utf8'));
  } catch {
    return false;
  }
}

router.post(
  '/auth/login',
  validateBody(AdminPanelLoginBodySchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };
    const deviceId = req.deviceId;
    const { phone, passwordSha256Hex } = environment.adminPanel;

    if (!phone || !passwordSha256Hex) {
      throw new AppError('Admin panel login is not configured', 503);
    }

    if (username.trim() !== phone) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!verifyPasswordSha256(password, passwordSha256Hex)) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = await userRepository.find({ filter: { phoneNumber: phone } });
    if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
      throw new AppError('Invalid credentials', 401);
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { unHashedRefreshToken } = await authService.login({
      phoneNumber: user.phoneNumber,
      deviceId,
      expiresAt,
    });

    const accessToken = await authService.generateAccessToken({
      deviceId,
      userId: user.id,
      role: user.role,
      refreshToken: unHashedRefreshToken,
    });

    const displayName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ').trim();

    new SuccessResponse(
      'Admin login successful',
      {
        token: accessToken,
        refreshToken: unHashedRefreshToken,
        admin: {
          id: user.id,
          displayName: displayName || user.phoneNumber,
          role: 'super_admin' as const,
        },
      },
      200
    ).send(res);
  })
);

export default router;
