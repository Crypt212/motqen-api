import { Prisma } from '../../../generated/prisma/client.js';

export type TransactionClient = Prisma.TransactionClient;

export interface ActivityLogOptions {
  actorId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an activity. Designed to be called within a Prisma transaction
 * to ensure atomicity with the operation being logged.
 *
 * Replaces the old logFinancialOperation() helper.
 */
export async function logActivity(tx: TransactionClient, options: ActivityLogOptions) {
  await tx.activityLog.create({
    data: {
      actorId: options.actorId,
      actionType: options.actionType,
      entityType: options.entityType,
      entityId: options.entityId,
      metadata: (options.metadata || {}) as any,
    },
  });
}
