import type { TransactionClient } from '../../prisma/Repository.js';
import { WithdrawRequest, WithdrawRequestCreateInput, WithdrawRequestStatus } from '../../../domain/financial/withdrawal.entity.js';

export interface IWithdrawRequestRepository {
  create(data: WithdrawRequestCreateInput, tx?: TransactionClient): Promise<{ created: boolean; request: WithdrawRequest }>;
  findById(id: string): Promise<WithdrawRequest | null>;
  findByWorkerId(workerProfileId: string, limit?: number, offset?: number): Promise<WithdrawRequest[]>;
  updateStatus(id: string, status: WithdrawRequestStatus, tx?: TransactionClient): Promise<WithdrawRequest>;
}
