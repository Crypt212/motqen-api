import { PrismaClient, EscrowHold as PrismaEscrowHold, Prisma } from '../../../generated/prisma/client.js';
import { handlePrismaError, Repository } from '../Repository.js';
import IEscrowHoldRepository, { TransactionClient } from '../../interfaces/financial/EscrowHoldRepository.js';
import { EscrowHold } from '../../../domain/financial/escrow.entity.js';

export default class EscrowHoldRepository extends Repository implements IEscrowHoldRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: PrismaEscrowHold): EscrowHold {
    return {
      id: record.id,
      orderId: record.orderId,
      paymentId: record.paymentId,
      totalAmount: record.totalAmount,
      workerAmount: record.workerAmount,
      platformFee: record.platformFee,
      feeRuleSnapshot: (record.feeRuleSnapshot ?? {}) as Record<string, unknown>,
      status: record.status,
      escrowReleaseEligibleAt: record.escrowReleaseEligibleAt,
      releasedAt: record.releasedAt,
      idempotencyKey: record.idempotencyKey,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async create(
    data: {
      orderId: string;
      paymentId: string;
      totalAmount: bigint;
      workerAmount: bigint;
      platformFee: bigint;
      feeRuleSnapshot: Record<string, unknown>;
      idempotencyKey: string;
    },
    tx?: TransactionClient,
  ): Promise<EscrowHold> {
    const client = tx || this.prismaClient;
    try {
      const record = await client.escrowHold.create({
        data: {
          orderId: data.orderId,
          paymentId: data.paymentId,
          totalAmount: data.totalAmount,
          workerAmount: data.workerAmount,
          platformFee: data.platformFee,
          feeRuleSnapshot: data.feeRuleSnapshot as Prisma.InputJsonValue,
          idempotencyKey: data.idempotencyKey,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create EscrowHold');
    }
  }

  async findById(id: string, tx?: TransactionClient): Promise<EscrowHold | null> {
    const client = tx || this.prismaClient;
    try {
      const record = await client.escrowHold.findUnique({
        where: { id },
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findById');
    }
  }

  async findByOrderId(orderId: string): Promise<EscrowHold | null> {
    try {
      const record = await this.prismaClient.escrowHold.findUnique({
        where: { orderId },
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findByOrderId');
    }
  }

  async updateStatus(
    id: string,
    status: EscrowHold['status'],
    tx?: TransactionClient,
  ): Promise<EscrowHold> {
    const client = tx || this.prismaClient;
    try {
      const record = await client.escrowHold.update({
        where: { id },
        data: { status },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateStatus');
    }
  }

  /**
   * Find escrow holds eligible for release.
   * Joins with orders, worker_profiles, verifications.
   * Checks: status=HELD, eligible_at <= NOW, verification=APPROVED, no open disputes.
   * Uses FOR UPDATE OF eh SKIP LOCKED to prevent cron overlap.
   */
  async findEligibleForRelease(limit: number): Promise<EscrowHold[]> {
    try {
      const records = await this.prismaClient.$queryRaw<PrismaEscrowHold[]>`
        SELECT eh.*
        FROM escrow_holds eh
        JOIN orders o ON eh."order_id" = o.id
        JOIN worker_profiles wp ON o.worker_profile_id = wp.id
        LEFT JOIN verifications v ON wp.id = v.worker_profile_id
        WHERE eh.status = 'HELD'
          AND eh.escrow_release_eligible_at <= NOW()
          AND (v.status = 'APPROVED' OR v.status IS NULL)
          AND NOT EXISTS (
            SELECT 1 FROM disputes d WHERE d.order_id = o.id AND d.status = 'OPEN'
          )
        ORDER BY eh.escrow_release_eligible_at ASC
        LIMIT ${limit}
        FOR UPDATE OF eh SKIP LOCKED
      `;
      return records.map((r) => this.toDomain(r));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findEligibleForRelease');
    }
  }

  /**
   * Lock a single escrow hold for update.
   * MUST be called inside a transaction.
   */
  async lockForUpdate(id: string, tx: TransactionClient): Promise<EscrowHold | null> {
    try {
      const records = await tx.$queryRaw<PrismaEscrowHold[]>`
        SELECT * FROM escrow_holds WHERE id = ${id} FOR UPDATE
      `;
      const record = records[0];
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'lockForUpdate EscrowHold');
    }
  }
}
