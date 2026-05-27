import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IRefundRepository } from '../../interfaces/financial/RefundRepository.js';
import { Refund, RefundCreateInput } from '../../../domain/financial/refund.entity.js';

export class RefundRepository extends Repository implements IRefundRepository {
  
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: RefundCreateInput, tx?: TransactionClient): Promise<{ created: boolean; refund: Refund }> {
    const client = tx || this.prismaClient;
    try {
      const refund = await client.refund.create({
        data: {
          orderId: data.orderId,
          escrowHoldId: data.escrowHoldId,
          amount: data.amount,
          reasonCode: data.reasonCode,
          refundType: data.refundType,
          originalPaymentReference: data.originalPaymentReference,
          externalRefundReference: data.externalRefundReference,
          initiatedBy: data.initiatedBy,
          idempotencyKey: data.idempotencyKey,
          notes: data.notes,
        },
      });
      return { created: true, refund: refund as unknown as Refund };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await client.refund.findUnique({
          where: { idempotencyKey: data.idempotencyKey },
        });
        if (existing) {
          return { created: false, refund: existing as unknown as Refund };
        }
      }
      throw error;
    }
  }

  async findByOrderId(orderId: string): Promise<Refund[]> {
    const refunds = await this.prismaClient.refund.findMany({
      where: { orderId },
    });
    return refunds as unknown as Refund[];
  }

  async findByIdempotencyKey(key: string): Promise<Refund | null> {
    const refund = await this.prismaClient.refund.findUnique({
      where: { idempotencyKey: key },
    });
    return refund as unknown as Refund | null;
  }
}
