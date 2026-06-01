import * as crypto from 'crypto';
import AppError from '../errors/AppError.js';
import { generateToken, verifyAndDecodeToken } from '../utils/tokens.js';
import AdminRepository from '../repositories/prisma/AdminRepository.js';
import AdminSessionRepository from '../repositories/prisma/AdminSessionRepository.js';
import { Admin } from '../domain/admin.entity.js';

export default class AdminAuthService {
  constructor(
    private adminRepository: AdminRepository,
    private adminSessionRepository: AdminSessionRepository
  ) {}

  async validateLogin(username: string, password: string) {
    const admin = await this.adminRepository.find({ filter: { username } });
    if (!admin || admin.status !== 'ACTIVE') {
      throw new AppError('Invalid credentials', 401);
    }

    const hash = crypto
      .scryptSync(password, process.env.ADMIN_PASSWORD_SALT ?? 'default-admin-salt', 64)
      .toString('hex');
    const storedHash = admin.passwordHash;
    if (
      !storedHash ||
      storedHash.length !== hash.length ||
      !crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
    ) {
      throw new AppError('Invalid credentials', 401);
    }

    return admin;
  }

  async createSession(admin: Admin) {
    const accessToken = generateToken({
      type: 'access',
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
      domain: 'admin',
    });
    const refreshToken = generateToken({
      type: 'refresh',
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
      domain: 'admin',
    });

    await this.adminSessionRepository.create({
      session: {
        adminId: admin.id,
        token: refreshToken,
        isRevoked: false,
        deviceId: 'web',
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = verifyAndDecodeToken(refreshToken, 'refresh');
    if (payload.type !== 'refresh' || payload.domain !== 'admin') {
      throw new AppError('Invalid refresh token', 401);
    }

    const session = await this.adminSessionRepository.find({
      filter: { token: refreshToken, isRevoked: false },
    });
    if (!session) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken = generateToken({
      type: 'access',
      adminId: payload.adminId,
      username: payload.username,
      role: payload.role,
      domain: 'admin',
    });

    await this.adminSessionRepository.update({
      filter: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return accessToken;
  }

  async revokeSessionsForAdmin(adminId: string, revokedBy: string) {
    await this.adminSessionRepository.revokeMany({
      filter: { adminId },
      revokedBy,
    });
  }
}
