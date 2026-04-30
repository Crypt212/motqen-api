import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IPayoutExecutionRepository } from '../../interfaces/financial/PayoutExecutionRepository.js';
import { PayoutExecution, PayoutExecutionCreateInput, PayoutExecutionStatus } from '../../../domain/financial/withdrawal.entity.js';

export class PayoutExecutionRepository extends Repository implements IPayoutExecutionRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: PayoutExecutionCreateInput, tx?: TransactionClient): Promise<{ created: boolean; execution: PayoutExecution }> {
    const client = tx || this.prismaClient;
    try {
      const execution = await client.payoutExecution.create({
        data: {
          withdrawRequestId: data.withdrawRequestId,
          amount: data.amount,
          idempotencyKey: data.idempotencyKey,
        },
      });
      return { created: true, execution: execution as unknown as PayoutExecution };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         // Return existing
         const existing = await client.payoutExecution.findUnique({
           where: { idempotencyKey: data.idempotencyKey },
         });
         if (existing) {
           return { created: false, execution: existing as unknown as PayoutExecution };
         }
      }
      throw error;
    }
  }

  async findByWithdrawRequestId(withdrawRequestId: string): Promise<PayoutExecution | null> {
    const execution = await this.prismaClient.payoutExecution.findUnique({
      where: { withdrawRequestId }, // Assuming UNIQUE in schema
    });
    return execution as unknown as PayoutExecution | null;
  }

  async updateStatus(
    id: string, 
    status: PayoutExecutionStatus, 
    data?: Partial<PayoutExecution>, 
    tx?: TransactionClient
  ): Promise<PayoutExecution> {
    const client = tx || this.prismaClient;
    
    const updateData: any = { status };
    if (data?.externalReferenceId !== undefined) updateData.externalReferenceId = data.externalReferenceId;
    if (data?.providerResponseCode !== undefined) updateData.providerResponseCode = data.providerResponseCode;
    if (data?.providerResponseMessage !== undefined) updateData.providerResponseMessage = data.providerResponseMessage;
    if (data?.executedAt !== undefined) updateData.executedAt = data.executedAt;
    if ((data as any)?.proofOfPaymentUrl !== undefined) updateData.proofOfPaymentUrl = (data as any).proofOfPaymentUrl;

    const execution = await client.payoutExecution.update({
      where: { id },
      data: updateData,
    });
    return execution as unknown as PayoutExecution;
  }

  async lockForUpdate(id: string, tx: TransactionClient): Promise<PayoutExecution | null> {
    const result = await tx.$queryRawUnsafe<any[]>(
      'SELECT * FROM payout_executions WHERE id = $1 FOR UPDATE',
      id
    );
    if (!result || result.length === 0) return null;
    
    // Convert BigInt to proper output if necessary? Or Prisma handles it.
    // The mapper logic requires snake_case to camelCase usually, but Prisma typed results might differ.
    // Let's just retrieve again after lock using findUnique for perfect typing.
    const execution = await tx.payoutExecution.findUnique({ where: { id } });
    return execution as unknown as PayoutExecution | null;
  }
}
