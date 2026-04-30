import { PrismaClient, ActivityLog as PrismaActivityLog } from '../../../generated/prisma/client.js';
import { Repository } from '../Repository.js';
import IActivityLogRepository, { TransactionClient } from '../../interfaces/financial/ActivityLogRepository.js';
import { ActivityLog, ActivityLogCreateInput } from '../../../domain/financial/activityLog.entity.js';

export default class ActivityLogRepository extends Repository implements IActivityLogRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: PrismaActivityLog): ActivityLog {
    return {
      id: record.id,
      actorId: record.actorId,
      actionType: record.actionType,
      entityType: record.entityType,
      entityId: record.entityId,
      metadata: record.metadata as Record<string, unknown> | null,
      createdAt: record.createdAt,
    };
  }

  async create(data: ActivityLogCreateInput, tx?: TransactionClient): Promise<ActivityLog> {
    const client = tx || this.prismaClient;
    const record = await client.activityLog.create({
      data: {
        actorId: data.actorId,
        actionType: data.actionType,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: (data.metadata || {}) as any,
      },
    });
    return this.toDomain(record);
  }

  async findByEntity(entityType: string, entityId: string, limit = 50): Promise<ActivityLog[]> {
    const records = await this.prismaClient.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByActor(actorId: string, limit = 50, offset = 0): Promise<ActivityLog[]> {
    const records = await this.prismaClient.activityLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => this.toDomain(r));
  }

  async findRecent(limit = 50): Promise<ActivityLog[]> {
    const records = await this.prismaClient.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return records.map((r) => this.toDomain(r));
  }
}
