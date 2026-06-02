import IEscrowHoldRepository from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import ITransactionLogRepository from '../../repositories/interfaces/financial/TransactionLogRepository.js';
import IWorkerBalanceRepository from '../../repositories/interfaces/financial/WorkerBalanceRepository.js';
import { generateDeterministicKey } from './helpers/idempotencyHelper.js';
import { TransactionClient } from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import { IWorkerDebtRepository } from '../../repositories/interfaces/financial/WorkerDebtRepository.js';
import { logActivity } from './helpers/activityLogger.js';
import { RefundService } from './RefundService.js';
import { serializeBigints } from '../../utils/serializeBigints.js';
import AppError from '../../errors/AppError.js';
import { EscrowService } from './EscrowService.js';
import { logger } from '../../libs/winston.js';

export class EscrowReleaseOrchestratorService {
  constructor(
    private readonly escrowHoldRepo: IEscrowHoldRepository,
    private readonly escrowService: EscrowService
  ) {}

  async findEligibleHolds(limit: number) {
    return this.escrowHoldRepo.findEligibleForRelease(limit);
  }

  async releaseEligibleHold(holdId: string): Promise<void> {
    await this.escrowService.releaseHold(holdId);
  }

  async processEligibleReleases(limit: number): Promise<{ released: number; failed: number }> {
    const holds = await this.findEligibleHolds(limit);
    let released = 0;
    let failed = 0;

    for (const hold of holds) {
      try {
        await this.releaseEligibleHold(hold.id);
        released += 1;
      } catch (error) {
        failed += 1;
        logger.warn('Escrow auto-release failed for hold', {
          holdId: hold.id,
          orderId: hold.orderId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { released, failed };
  }
}
