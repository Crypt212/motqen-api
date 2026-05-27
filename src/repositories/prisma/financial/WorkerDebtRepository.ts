import { PrismaClient } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IWorkerDebtRepository } from '../../interfaces/financial/WorkerDebtRepository.js';
import { WorkerDebt, WorkerDebtCreateInput, WorkerDebtStatus } from '../../../domain/financial/debt.entity.js';

export class WorkerDebtRepository extends Repository implements IWorkerDebtRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: WorkerDebtCreateInput, tx?: TransactionClient): Promise<WorkerDebt> {
    const client = tx || this.prismaClient;
    const debt = await client.workerDebt.create({
      data: {
        workerProfileId: data.workerProfileId,
        refundId: data.refundId,
        originalAmount: data.originalAmount,
        outstandingAmount: data.outstandingAmount,
      },
    });
    return debt as unknown as WorkerDebt;
  }

  async findOutstandingByWorkerId(workerProfileId: string, tx?: TransactionClient): Promise<WorkerDebt[]> {
    const client = tx || this.prismaClient;
    const debts = await client.workerDebt.findMany({
      where: { 
        workerProfileId,
        status: { in: ['OUTSTANDING', 'SETTLING'] }
      },
      orderBy: { createdAt: 'asc' }, // usually oldest first
    });
    return debts as unknown as WorkerDebt[];
  }

  async updateAmount(id: string, newOutstanding: bigint, newStatus: WorkerDebtStatus, tx?: TransactionClient): Promise<WorkerDebt> {
    const client = tx || this.prismaClient;
    const debt = await client.workerDebt.update({
      where: { id },
      data: {
        outstandingAmount: newOutstanding,
        status: newStatus,
        settledAt: newStatus === 'SETTLED' ? new Date() : null,
      },
    });
    return debt as unknown as WorkerDebt;
  }

  async findById(id: string, tx?: TransactionClient): Promise<WorkerDebt | null> {
    const client = tx || this.prismaClient;
    const debt = await client.workerDebt.findUnique({
      where: { id },
    });
    return debt as unknown as WorkerDebt | null;
  }

  async findMany(options?: any): Promise<WorkerDebt[]> {
    const debts = await this.prismaClient.workerDebt.findMany(options);
    return debts as unknown as WorkerDebt[];
  }
}
