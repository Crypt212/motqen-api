import { AdminRole } from '../domain/admin.entity.js';
import {
  AdminAuditAction,
  AdminAuditActor,
  AdminAuditCategory,
  AdminAuditLogCreateInput,
  AdminAuditLogSearchFilter,
} from '../domain/adminAuditLog.entity.js';
import AdminAuditLogRepository, {
  AdminAuditPagination,
  AdminAuditPaginatedResult,
} from '../repositories/prisma/AdminAuditLogRepository.js';

type MetricsParams = {
  role: AdminRole;
  startDate?: Date;
  endDate?: Date;
};

export default class AdminAuditLogService {
  constructor(private readonly adminAuditLogRepository: AdminAuditLogRepository) {}

  categoriesForRole(role: AdminRole): AdminAuditCategory[] | undefined {
    if (role === 'SUPER_ADMIN') return undefined;
    if (role === 'USER_MANAGEMENT') return ['USER_MANAGEMENT'];
    if (role === 'FINANCIAL_MONITOR') return ['FINANCIAL'];
    if (role === 'ISSUES_MANAGEMENT') return ['ISSUES'];
    return [];
  }

  actorFromAdminState(adminState?: {
    adminId: string;
    username: string;
    role: string;
  }): AdminAuditActor | null {
    if (!adminState) return null;
    return {
      adminId: adminState.adminId,
      username: adminState.username,
      role: adminState.role as AdminRole,
    };
  }

  async record(data: AdminAuditLogCreateInput) {
    return this.adminAuditLogRepository.create({
      ...data,
      metadata: this.sanitizeMetadata(data.metadata),
    });
  }

  async search(params: {
    role: AdminRole;
    filter: Omit<AdminAuditLogSearchFilter, 'categories'>;
    pagination?: AdminAuditPagination;
  }): Promise<AdminAuditPaginatedResult> {
    return this.adminAuditLogRepository.search({
      filter: {
        ...params.filter,
        categories: this.categoriesForRole(params.role),
      },
      pagination: params.pagination,
    });
  }

  async metrics(params: MetricsParams) {
    const categories = this.categoriesForRole(params.role);
    const common = {
      categories,
      startDate: params.startDate,
      endDate: params.endDate,
    };

    const [
      loginCount,
      failedLoginCount,
      criticalActionCount,
      actionsByAdmin,
      actionsByRole,
    ] = await Promise.all([
      this.adminAuditLogRepository.countByAction({
        action: 'ADMIN_LOGIN_SUCCESS',
        ...common,
      }),
      this.adminAuditLogRepository.countByAction({
        action: 'ADMIN_LOGIN_FAILED',
        ...common,
      }),
      this.adminAuditLogRepository.countCritical(common),
      this.adminAuditLogRepository.groupActionsByAdmin({ ...common, limit: 10 }),
      this.adminAuditLogRepository.groupActionsByRole(common),
    ]);

    return {
      loginCount,
      failedLoginCount,
      criticalActionCount,
      actionsByAdmin,
      actionsByRole,
    };
  }

  private sanitizeMetadata(metadata?: Record<string, unknown> | null): Record<string, unknown> {
    if (!metadata) return {};

    const forbiddenKeys = new Set(['password', 'passwordHash', 'token', 'accessToken', 'refreshToken']);
    return Object.fromEntries(
      Object.entries(metadata).filter(([key]) => !forbiddenKeys.has(key))
    );
  }
}

export const AdminAuditActions = {
  ADMIN_LOGIN_SUCCESS: 'ADMIN_LOGIN_SUCCESS' as AdminAuditAction,
  ADMIN_LOGIN_FAILED: 'ADMIN_LOGIN_FAILED' as AdminAuditAction,
  ADMIN_LOGOUT: 'ADMIN_LOGOUT' as AdminAuditAction,
};
