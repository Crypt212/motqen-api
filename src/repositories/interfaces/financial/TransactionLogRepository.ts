import { Prisma } from '../../../generated/prisma/client.js';
import { TransactionLog, TransactionLogCreateInput } from '../../../domain/financial/transactionLog.entity.js';

export type TransactionClient = Prisma.TransactionClient;

export default interface ITransactionLogRepository {
  create(data: TransactionLogCreateInput, tx?: TransactionClient): Promise<TransactionLog>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<TransactionLog[]>;
  findByReference(referenceId: string, referenceType: string): Promise<TransactionLog[]>;
}
