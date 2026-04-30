import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IWithdrawRequestRepository } from '../../interfaces/financial/WithdrawRequestRepository.js';
import { WithdrawRequest, WithdrawRequestCreateInput, WithdrawRequestStatus } from '../../../domain/financial/withdrawal.entity.js';

export class WithdrawRequestRepository extends Repository implements IWithdrawRequestRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: WithdrawRequestCreateInput, tx?: TransactionClient): Promise<{ created: boolean; request: WithdrawRequest }> {
    const client = tx || this.prismaClient;
    try {
      const request = await client.withdrawRequest.create({
        data: {
          workerProfileId: data.workerProfileId,
          workerBalanceId: data.workerBalanceId,
          payoutMethodId: data.payoutMethodId,
          amount: data.amount,
          payoutMethodSnapshot: data.payoutMethodSnapshot as object,
          idempotencyKey: data.idempotencyKey,
        },
      });
      return { created: true, request: request as unknown as WithdrawRequest };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target as Array<string> | string | undefined;
        let isIdempotencyKeyConflict = false;

        if (Array.isArray(target) && target.includes('idempotency_key')) {
         isIdempotencyKeyConflict = true;
        } else if (typeof target === 'string' && target.includes('idempotencyKey')) {
         isIdempotencyKeyConflict = true;
        } else if (target && target.includes('idempotencyKey')) {
         isIdempotencyKeyConflict = true;
        }

        if (isIdempotencyKeyConflict) {
          const existing = await client.withdrawRequest.findUnique({
            where: { idempotencyKey: data.idempotencyKey },
          });
          if (existing) {
            return { created: false, request: existing as unknown as WithdrawRequest };
          }
        }
      }
      throw error;
    }
  }

  async findById(id: string): Promise<WithdrawRequest | null> {
    const request = await this.prismaClient.withdrawRequest.findUnique({
      where: { id },
    });
    return request as unknown as WithdrawRequest | null;
  }

  async findByWorkerId(workerProfileId: string, limit: number = 20, offset: number = 0): Promise<WithdrawRequest[]> {
    const requests = await this.prismaClient.withdrawRequest.findMany({
      where: { workerProfileId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return requests as unknown as WithdrawRequest[];
  }

  async updateStatus(id: string, status: WithdrawRequestStatus, tx?: TransactionClient): Promise<WithdrawRequest> {
    const client = tx || this.prismaClient;
    const request = await client.withdrawRequest.update({
      where: { id },
      data: { status },
    });
    return request as unknown as WithdrawRequest;
  }
}
