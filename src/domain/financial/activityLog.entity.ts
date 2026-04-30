import { IDType } from '../../repositories/interfaces/Repository.js';

export type ActivityLog = {
  id: IDType;
  actorId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export type ActivityLogCreateInput = {
  actorId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};
