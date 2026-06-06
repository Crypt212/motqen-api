import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IWithdrawRequestRepository } from '../../interfaces/financial/WithdrawRequestRepository.js';
import {
  WithdrawRequest,
  WithdrawRequestCreateInput,
  WithdrawRequestStatus,
} from '../../../domain/financial/withdrawal.entity.js';
import { ListWithdrawRequestsOptions, CursorPaginatedResult } from '../../../schemas/financial/withdrawal.schema.js';

export class WithdrawRequestRepository extends Repository implements IWithdrawRequestRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(
    data: WithdrawRequestCreateInput,
    tx?: TransactionClient
  ): Promise<{ created: boolean; request: WithdrawRequest }> {
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
        if (
          target &&
          (Array.isArray(target) ? target.includes('idempotencyKey') : target === 'idempotencyKey')
        ) {
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

  async findById(id: string, tx?: TransactionClient): Promise<WithdrawRequest | null> {
    const client = tx || this.prismaClient;
    const request = await client.withdrawRequest.findUnique({
      where: { id },
    });
    return request as unknown as WithdrawRequest | null;
  }

  async findMany(
    options: ListWithdrawRequestsOptions
  ): Promise<CursorPaginatedResult<WithdrawRequest>> {
    const {
      filter,
      cursor,
      limit = 20,
      sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    } = options;

    const where: Prisma.WithdrawRequestWhereInput = {};
    if (filter.workerProfileId) {
      where.workerProfileId = filter.workerProfileId;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.payoutMethodType) {
      where.payoutMethodSnapshot = {
        path: ['methodType'],
        equals: filter.payoutMethodType,
      };
    }
    
    if (filter.createdFrom || filter.createdTo) {
      where.createdAt = {};
      if (filter.createdFrom) where.createdAt.gte = filter.createdFrom;
      if (filter.createdTo) where.createdAt.lte = filter.createdTo;
    }
    
    if (filter.workerName || filter.phoneNumber) {
      where.workerProfile = {
        user: {
          ...(filter.workerName ? {
            OR: [
              { firstName: { contains: filter.workerName } },
              { lastName: { contains: filter.workerName } },
              { middleName: { contains: filter.workerName } }
            ]
          } : {}),
          ...(filter.phoneNumber ? { phoneNumber: { contains: filter.phoneNumber } } : {})
        }
      };
    }

    const requests = await this.prismaClient.withdrawRequest.findMany({
      where,
      include: {
        workerProfile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                middleName: true,
                phoneNumber: true
              }
            }
          }
        },
        payoutExecution: true
      },
      orderBy: { [sort.sortBy]: sort.sortOrder },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let hasNext = false;
    let nextCursor: string | null = null;

    if (requests.length > limit) {
      hasNext = true;
      requests.pop();
    }

    if (requests.length > 0) {
      nextCursor = requests[requests.length - 1].id;
    }

    return {
      items: requests as unknown as WithdrawRequest[],
      nextCursor,
      hasNext,
    };
  }

  async updateStatus(
    id: string,
    status: WithdrawRequestStatus,
    tx?: TransactionClient
  ): Promise<WithdrawRequest> {
    const client = tx || this.prismaClient;
    const request = await client.withdrawRequest.update({
      where: { id },
      data: { status },
    });
    return request as unknown as WithdrawRequest;
  }

  async update(
    id: string,
    data: Partial<WithdrawRequest>,
    tx?: TransactionClient
  ): Promise<WithdrawRequest> {
    const client = tx || this.prismaClient;
    const request = await client.withdrawRequest.update({
      where: { id },
      data: data as Prisma.WithdrawRequestUpdateInput,
    });
    return request as unknown as WithdrawRequest;
  }

  async hasActiveRequests(payoutMethodId: string): Promise<boolean> {
    const count = await this.prismaClient.withdrawRequest.count({
      where: {
        payoutMethodId,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
    });
    return count > 0;
  }
}
