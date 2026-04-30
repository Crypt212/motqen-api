import { PrismaClient, WorkerBalance as PrismaWorkerBalance } from '../../../generated/prisma/client.js';
import { handlePrismaError, Repository } from '../Repository.js';
import IWorkerBalanceRepository, { TransactionClient } from '../../interfaces/financial/WorkerBalanceRepository.js';
import { WorkerBalance, WorkerBalanceUpdateInput } from '../../../domain/financial/workerBalance.entity.js';
import AppError from '../../../errors/AppError.js';
import { assertBalanceInvariant } from '../../../services/financial/helpers/balanceGuard.js';

export default class WorkerBalanceRepository extends Repository implements IWorkerBalanceRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: PrismaWorkerBalance): WorkerBalance {
    return {
      id: record.id,
      workerProfileId: record.workerProfileId,
      totalEarned: record.totalEarned,
      withdrawn: record.withdrawn,
      pendingWithdraw: record.pendingWithdraw,
      onHoldForDispute: record.onHoldForDispute,
      deductedForDebts: record.deductedForDebts,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async create(workerProfileId: string, tx?: TransactionClient): Promise<WorkerBalance> {
    const client = tx || this.prismaClient;
    try {
      const record = await client.workerBalance.create({
        data: {
          workerProfileId,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create WorkerBalance');
    }
  }

  async findByWorkerProfileId(id: string): Promise<WorkerBalance | null> {
    try {
      const record = await this.prismaClient.workerBalance.findUnique({
        where: { workerProfileId: id },
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findByWorkerProfileId');
    }
  }

  /**
   * Lock a worker balance row for update.
   * MUST be called inside a transaction.
   */
  async lockForUpdate(workerProfileId: string, tx: TransactionClient): Promise<WorkerBalance | null> {
    try {
      const records = await tx.$queryRaw<PrismaWorkerBalance[]>`
        SELECT * FROM worker_balances WHERE worker_profile_id = ${workerProfileId} FOR UPDATE
      `;
      const record = records[0];
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'lockForUpdate WorkerBalance');
    }
  }

  /**
   * Update a worker balance with optimistic version locking.
   * Uses `$executeRaw` with tagged template (auto-parameterized).
   * `WHERE id = $1 AND version = $expectedVersion`.
   * If 0 rows affected, throws a 409 version conflict error.
   *
   * @param id - WorkerBalance ID
   * @param data - Fields to update
   * @param expectedVersion - Current version number (must match DB)
   * @param tx - Transaction client (REQUIRED — must be inside a transaction)
   * @throws AppError 409 if version mismatch
   */
  async update(
    id: string,
    data: WorkerBalanceUpdateInput,
    expectedVersion: number,
    tx: TransactionClient,
  ): Promise<WorkerBalance> {
    try {
      const totalEarned = data.totalEarned !== undefined ? data.totalEarned : null;
      const withdrawn = data.withdrawn !== undefined ? data.withdrawn : null;
      const pendingWithdraw = data.pendingWithdraw !== undefined ? data.pendingWithdraw : null;
      const onHoldForDispute = data.onHoldForDispute !== undefined ? data.onHoldForDispute : null;
      const deductedForDebts = data.deductedForDebts !== undefined ? data.deductedForDebts : null;

      const result = await tx.$executeRaw`
        UPDATE worker_balances
           SET total_earned = COALESCE(${totalEarned}, total_earned),
               withdrawn = COALESCE(${withdrawn}, withdrawn),
               pending_withdraw = COALESCE(${pendingWithdraw}, pending_withdraw),
               on_hold_for_dispute = COALESCE(${onHoldForDispute}, on_hold_for_dispute),
               deducted_for_debts = COALESCE(${deductedForDebts}, deducted_for_debts),
               version = version + 1,
               updated_at = NOW()
         WHERE id = ${id} AND version = ${expectedVersion}
      `;

      if (result === 0) {
        throw new AppError('Balance version conflict', 409);
      }

      // Fetch the updated record
      const records = await tx.$queryRaw<PrismaWorkerBalance[]>`
        SELECT * FROM worker_balances WHERE id = ${id}
      `;
      const record = records[0];

      if (!record) {
        throw new AppError('WorkerBalance not found after update', 500);
      }

      const domainRecord = this.toDomain(record);
      assertBalanceInvariant(domainRecord, 'WorkerBalance update');

      return domainRecord;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw handlePrismaError(error as Error, 'update WorkerBalance');
    }
  }
}
