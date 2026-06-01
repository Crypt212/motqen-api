import { PrismaClient } from '../../generated/prisma/client.js';
import {
  AdminAuditLog,
  AdminAuditLogCreateInput,
  AdminAuditLogSearchFilter,
  AdminAuditCategory,
} from '../../domain/adminAuditLog.entity.js';
import { handlePrismaError, Repository } from './Repository.js';
import { handlePagination } from '../../utils/handleFilteration.js';

export type AdminAuditPagination = {
  page?: number;
  limit?: number;
};

export type AdminAuditPaginatedResult = {
  items: AdminAuditLog[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export default class AdminAuditLogRepository extends Repository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private get client(): any {
    return this.prismaClient as any;
  }

  private toDomain(record: any): AdminAuditLog {
    return {
      id: record.id,
      actorAdminId: record.actorAdminId ?? null,
      actorUsername: record.actorUsername ?? null,
      actorRole: record.actorRole ?? null,
      action: record.action,
      category: record.category,
      severity: record.severity,
      targetType: record.targetType ?? null,
      targetId: record.targetId ?? null,
      metadata: (record.metadata as Record<string, unknown> | null) ?? null,
      ipAddress: record.ipAddress ?? null,
      userAgent: record.userAgent ?? null,
      createdAt: record.createdAt,
    };
  }

  private buildWhere(filter: AdminAuditLogSearchFilter): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter.action) where.action = filter.action;
    if (filter.severity) where.severity = filter.severity;
    if (filter.actorId) where.actorAdminId = filter.actorId;
    if (filter.targetType) where.targetType = filter.targetType;
    if (filter.targetId) where.targetId = filter.targetId;
    if (filter.categories?.length) where.category = { in: filter.categories };
    if (filter.startDate || filter.endDate) {
      where.createdAt = {
        ...(filter.startDate ? { gte: filter.startDate } : {}),
        ...(filter.endDate ? { lte: filter.endDate } : {}),
      };
    }

    return where;
  }

  async create(data: AdminAuditLogCreateInput): Promise<AdminAuditLog> {
    try {
      const record = await this.client.adminAuditLog.create({
        data: {
          actorAdminId: data.actor?.adminId ?? null,
          actorUsername: data.actor?.username ?? null,
          actorRole: data.actor?.role ?? null,
          action: data.action,
          category: data.category,
          severity: data.severity,
          targetType: data.targetType ?? null,
          targetId: data.targetId ?? null,
          metadata: data.metadata ?? {},
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error, 'create admin audit log');
    }
  }

  async search(params: {
    filter: AdminAuditLogSearchFilter;
    pagination?: AdminAuditPagination;
  }): Promise<AdminAuditPaginatedResult> {
    try {
      const where = this.buildWhere(params.filter);
      const total = await this.client.adminAuditLog.count({ where });
      const { paginationQuery, paginationResult } = handlePagination({
        total,
        paginationOptions: {
          page: params.pagination?.page ?? 1,
          limit: params.pagination?.limit ?? 20,
        },
      });

      const records = await this.client.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginationQuery,
      });

      return {
        items: records.map((record: any) => this.toDomain(record)),
        page: paginationResult.page,
        limit: paginationResult.limit,
        total: paginationResult.total,
        hasNext: paginationResult.hasNext,
        hasPrevious: paginationResult.hasPrev,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error, 'search admin audit logs');
    }
  }

  async countByAction(params: {
    action: string;
    categories?: AdminAuditCategory[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const where = this.buildWhere({
      action: params.action,
      categories: params.categories,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return this.client.adminAuditLog.count({ where });
  }

  async countCritical(params: {
    categories?: AdminAuditCategory[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const where = this.buildWhere({
      severity: 'CRITICAL',
      categories: params.categories,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return this.client.adminAuditLog.count({ where });
  }

  async groupActionsByAdmin(params: {
    categories?: AdminAuditCategory[];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<{ actorAdminId: string | null; actorUsername: string | null; count: number }[]> {
    const where = this.buildWhere({
      categories: params.categories,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const grouped = await this.client.adminAuditLog.groupBy({
      by: ['actorAdminId', 'actorUsername'],
      where,
      _count: { _all: true },
      orderBy: { _count: { actorAdminId: 'desc' } },
      take: params.limit ?? 10,
    });

    return grouped.map((item: any) => ({
      actorAdminId: item.actorAdminId ?? null,
      actorUsername: item.actorUsername ?? null,
      count: item._count._all,
    }));
  }

  async groupActionsByRole(params: {
    categories?: AdminAuditCategory[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ actorRole: string | null; count: number }[]> {
    const where = this.buildWhere({
      categories: params.categories,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const grouped = await this.client.adminAuditLog.groupBy({
      by: ['actorRole'],
      where,
      _count: { _all: true },
      orderBy: { _count: { actorRole: 'desc' } },
    });

    return grouped.map((item: any) => ({
      actorRole: item.actorRole ?? null,
      count: item._count._all,
    }));
  }
}
