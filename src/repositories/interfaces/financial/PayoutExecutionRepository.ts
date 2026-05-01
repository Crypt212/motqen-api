import type { TransactionClient } from '../../prisma/Repository.js';
import { PayoutExecution, PayoutExecutionCreateInput, PayoutExecutionStatus } from '../../../domain/financial/withdrawal.entity.js';

export interface IPayoutExecutionRepository {
  create(data: PayoutExecutionCreateInput, tx?: TransactionClient): Promise<{ created: boolean; execution: PayoutExecution }>;
  findByWithdrawRequestId(requestId: string): Promise<PayoutExecution | null>;
  updateStatus(id: string, status: PayoutExecutionStatus, data?: Partial<PayoutExecution>, tx?: TransactionClient): Promise<PayoutExecution>;
  lockForUpdate(id: string, tx: TransactionClient): Promise<PayoutExecution | null>;
}
