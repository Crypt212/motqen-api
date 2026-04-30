import { Prisma } from '../../../generated/prisma/client.js';
import { ActivityLog, ActivityLogCreateInput } from '../../../domain/financial/activityLog.entity.js';

export type TransactionClient = Prisma.TransactionClient;

export default interface IActivityLogRepository {
  create(data: ActivityLogCreateInput, tx?: TransactionClient): Promise<ActivityLog>;
  findByEntity(entityType: string, entityId: string, limit?: number): Promise<ActivityLog[]>;
  findByActor(actorId: string, limit?: number, offset?: number): Promise<ActivityLog[]>;
  findRecent(limit?: number): Promise<ActivityLog[]>;
}
