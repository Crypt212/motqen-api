import AppError from '../errors/AppError.js';
import AdminRepository from '../repositories/prisma/AdminRepository.js';
import { adminAuditLogService } from '../state.js';
import { redisClearCache } from '../utils/redis.js';
import { AdminRole, AdminStatus, Admin } from '../domain/admin.entity.js';

export default class AdminUsersService {
  constructor(private adminRepository: AdminRepository) {}

  async listAdmins(): Promise<Admin[]> {
    return this.adminRepository.findMany({ filter: {} });
  }

  async createAdmin(params: {
    data: any;
    actorId: string;
    actorUsername: string;
  }): Promise<Admin> {
    const { username, password, firstName, lastName, role, profileImageUrl } = params.data;
    
    // Check if username exists
    const existing = await this.adminRepository.find({ filter: { username } });
    if (existing) {
      throw new AppError('Username already exists', 409);
    }

    const salt = process.env.ADMIN_PASSWORD_SALT || 'default-admin-salt';
    const crypto = await import('crypto');
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

    const admin = await this.adminRepository.create({
      admin: {
        username,
        passwordHash,
        firstName,
        lastName,
        role,
        profileImageUrl: profileImageUrl || null,
        status: 'ACTIVE',
      }
    });

    const { adminAuditLogService } = await import('../state.js');
    await adminAuditLogService.record({
      actor: { adminId: params.actorId, username: params.actorUsername, role: 'SUPER_ADMIN' },
      action: 'ADMIN_CREATED',
      category: 'ADMIN_MANAGEMENT',
      severity: 'WARNING',
      targetType: 'ADMIN',
      targetId: admin.id,
      metadata: { username: admin.username, role: admin.role },
    });

    return admin;
  }

  async updateAdminRole(params: {
    adminId: string;
    role: AdminRole;
    actorId: string;
    actorUsername: string;
  }): Promise<Admin> {
    const admin = await this.adminRepository.find({ filter: { id: params.adminId } });
    if (!admin) throw new AppError('Admin not found', 404);

    const updated = await this.adminRepository.update({
      filter: { id: params.adminId },
      admin: { role: params.role },
    });

    await redisClearCache(`admin:${params.adminId}`);

    await adminAuditLogService.record({
      actor: { adminId: params.actorId, username: params.actorUsername, role: 'SUPER_ADMIN' },
      action: 'ADMIN_ROLE_CHANGED',
      category: 'ADMIN_MANAGEMENT',
      severity: 'WARNING',
      targetType: 'ADMIN',
      targetId: params.adminId,
      metadata: { previousRole: admin.role, newRole: params.role },
    });

    return updated;
  }

  async updateAdminStatus(params: {
    adminId: string;
    status: AdminStatus;
    actorId: string;
    actorUsername: string;
  }): Promise<Admin> {
    const admin = await this.adminRepository.find({ filter: { id: params.adminId } });
    if (!admin) throw new AppError('Admin not found', 404);

    const updated = await this.adminRepository.update({
      filter: { id: params.adminId },
      admin: { status: params.status },
    });

    await redisClearCache(`admin:${params.adminId}`);

    await adminAuditLogService.record({
      actor: { adminId: params.actorId, username: params.actorUsername, role: 'SUPER_ADMIN' },
      action: params.status === 'ACTIVE' ? 'ADMIN_ENABLED' : 'ADMIN_DISABLED',
      category: 'ADMIN_MANAGEMENT',
      severity: 'WARNING',
      targetType: 'ADMIN',
      targetId: params.adminId,
      metadata: { previousStatus: admin.status, newStatus: params.status },
    });

    return updated;
  }
}
