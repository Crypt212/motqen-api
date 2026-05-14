import type { TransactionClient } from '../../prisma/Repository.js';
import { WithdrawRequest, WithdrawRequestCreateInput, WithdrawRequestStatus } from '../../../domain/financial/withdrawal.entity.js';
import { ListWithdrawRequestsOptions, CursorPaginatedResult } from '../../../schemas/financial/withdrawal.schema.js';

export interface IWithdrawRequestRepository {
  create(data: WithdrawRequestCreateInput, tx?: TransactionClient): Promise<{ created: boolean; request: WithdrawRequest }>;
  findById(id: string, tx?: TransactionClient): Promise<WithdrawRequest | null>;
  findMany(options: ListWithdrawRequestsOptions): Promise<CursorPaginatedResult<WithdrawRequest>>;
  updateStatus(id: string, status: WithdrawRequestStatus, tx?: TransactionClient): Promise<WithdrawRequest>;
  update(id: string, data: Partial<WithdrawRequest>, tx?: TransactionClient): Promise<WithdrawRequest>;
  hasActiveRequests(payoutMethodId: string): Promise<boolean>;
}
