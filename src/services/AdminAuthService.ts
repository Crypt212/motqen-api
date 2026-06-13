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
    console.log('🔍 Admin found:', admin ? `${admin.username} (${admin.status})` : 'NOT FOUND');
    if (!admin || admin.status !== 'ACTIVE') {
      throw new AppError('Invalid credentials', 401);
    }

    const hash = crypto
      .scryptSync(password, process.env.ADMIN_PASSWORD_SALT ?? 'default-admin-salt', 64)
      .toString('hex');
    const storedHash = admin.passwordHash;
    console.log('🔐 Password validation:');
    console.log('   Salt:', process.env.ADMIN_PASSWORD_SALT ?? 'default-admin-salt');
    console.log('   Calculated hash length:', hash.length);
    console.log('   Stored hash length:', storedHash?.length);
    console.log('   Calculated hash:', hash.substring(0, 32) + '...');
    console.log('   Stored hash:', storedHash?.substring(0, 32) + '...');

    if (
      !storedHash ||
      storedHash.length !== hash.length ||
      !crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
    ) {
      console.log('❌ Password validation FAILED');
      throw new AppError('Invalid credentials', 401);
    }
    console.log('✅ Password validation PASSED');

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
