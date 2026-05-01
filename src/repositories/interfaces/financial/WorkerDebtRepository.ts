import type { TransactionClient } from '../../prisma/Repository.js';
import { WorkerDebt, WorkerDebtCreateInput, WorkerDebtStatus } from '../../../domain/financial/debt.entity.js';

export interface IWorkerDebtRepository {
  create(data: WorkerDebtCreateInput, tx?: TransactionClient): Promise<WorkerDebt>;
  findOutstandingByWorkerId(workerProfileId: string, tx?: TransactionClient): Promise<WorkerDebt[]>;
  updateAmount(id: string, newOutstanding: bigint, newStatus: WorkerDebtStatus, tx?: TransactionClient): Promise<WorkerDebt>;
}
