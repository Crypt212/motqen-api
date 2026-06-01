import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  AdminSession,
  AdminSessionCreateInput,
  AdminSessionFilter,
} from '../../domain/adminSession.entity.js';
import { isEmptyFilter } from './utils.js';
import { PrismaClient } from '../../generated/prisma/client.js';

export default class AdminSessionRepository extends Repository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: any): AdminSession {
    return {
      id: record.id,
      adminId: record.adminId,
      token: record.token,
      isRevoked: record.isRevoked,
      revokedAt: record.revokedAt ?? null,
      revokedBy: record.revokedBy ?? null,
      deviceId: record.deviceId,
      fcmToken: record.fcmToken ?? null,
      lastUsedAt: record.lastUsedAt,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async find(params: { filter: AdminSessionFilter }): Promise<AdminSession | null> {
    try {
      const { filter } = params;
      const record = await (this.prismaClient as any).adminSession.findFirst({ where: filter });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async create(params: { session: AdminSessionCreateInput }): Promise<AdminSession> {
    try {
      const record = await (this.prismaClient as any).adminSession.create({
        data: {
          adminId: params.session.adminId,
          token: params.session.token,
          isRevoked: params.session.isRevoked ?? false,
          deviceId: params.session.deviceId,
          fcmToken: params.session.fcmToken ?? null,
          lastUsedAt: params.session.lastUsedAt,
          expiresAt: params.session.expiresAt,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async update(params: {
    filter: AdminSessionFilter;
    data: Partial<AdminSessionCreateInput>;
  }): Promise<AdminSession> {
    try {
      const { filter, data } = params;
      if (isEmptyFilter(filter)) throw new Error('Update filter cannot be empty');

      const existing = await (this.prismaClient as any).adminSession.findFirst({ where: filter });
      if (!existing) throw new Error('Admin session not found');

      const record = await (this.prismaClient as any).adminSession.update({
        where: { id: existing.id },
        data,
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async revoke(params: { filter: AdminSessionFilter; revokedBy: IDType }): Promise<void> {
    try {
      const { filter, revokedBy } = params;
      if (isEmptyFilter(filter)) return;
      const existing = await (this.prismaClient as any).adminSession.findFirst({ where: filter });
      if (!existing) return;
      await (this.prismaClient as any).adminSession.update({
        where: { id: existing.id },
        data: { isRevoked: true, revokedAt: new Date(), revokedBy },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'revoke');
    }
  }

  async revokeMany(params: {
    filter: AdminSessionFilter;
    revokedBy: IDType;
    excludeId?: IDType;
  }): Promise<void> {
    try {
      const { filter, revokedBy, excludeId } = params;
      if (isEmptyFilter(filter)) return;
      const where: any = { ...filter };
      if (excludeId) {
        where.NOT = { id: excludeId };
      }
      await (this.prismaClient as any).adminSession.updateMany({
        where,
        data: { isRevoked: true, revokedAt: new Date(), revokedBy },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'revokeMany');
    }
  }

  async findMany(params: { filter: AdminSessionFilter }): Promise<AdminSession[]> {
    try {
      const { filter } = params;
      const records = await (this.prismaClient as any).adminSession.findMany({ where: filter });
      return records.map((record: any) => this.toDomain(record));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }
}
