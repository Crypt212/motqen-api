import { Prisma } from '../../../generated/prisma/client.js';
import { WorkerBalance, WorkerBalanceUpdateInput } from '../../../domain/financial/workerBalance.entity.js';

export type TransactionClient = Prisma.TransactionClient;

export default interface IWorkerBalanceRepository {
  create(workerProfileId: string, tx?: TransactionClient): Promise<WorkerBalance>;
  findByWorkerProfileId(id: string): Promise<WorkerBalance | null>;
  lockForUpdate(workerProfileId: string, tx: TransactionClient): Promise<WorkerBalance | null>;
  update(id: string, data: WorkerBalanceUpdateInput, expectedVersion: number, tx: TransactionClient): Promise<WorkerBalance>;
}
