import { Prisma, PrismaClient } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IPayoutMethodRepository, PayoutMethodUpdateInput } from '../../interfaces/financial/PayoutMethodRepository.js';
import {
  PayoutMethod,
  PayoutMethodCreateInput,
} from '../../../domain/financial/withdrawal.entity.js';

export class PayoutMethodRepository extends Repository implements IPayoutMethodRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: PayoutMethodCreateInput, tx?: TransactionClient): Promise<{created:boolean, payoutMethod: PayoutMethod}> {
    const client = tx || this.prismaClient;
    try {
      const method = await client.payoutMethod.create({
        data: {
          workerProfileId: data.workerProfileId,
          methodType: data.methodType,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
        },
      });
      return { created: true, payoutMethod: method as unknown as PayoutMethod };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await client.payoutMethod.findFirst({
          where: { accountNumber: data.accountNumber },
        });
        if (existing) {
          return { created: false, payoutMethod: existing as unknown as PayoutMethod };
        }
      }
      throw error;
    }
  }
  async findByWorkerId(workerProfileId: string): Promise<PayoutMethod[]> {
    const methods = await this.prismaClient.payoutMethod.findMany({
      where: { workerProfileId },
    });
    return methods as unknown as PayoutMethod[];
  }

  async findById(id: string, tx?: TransactionClient): Promise<PayoutMethod | null> {
    const client = tx || this.prismaClient;
    const method = await client.payoutMethod.findUnique({
      where: { id },
    });
    return method as unknown as PayoutMethod | null;
  }

  async update(id: string, data: PayoutMethodUpdateInput, tx?: TransactionClient): Promise<PayoutMethod> {
    const client = tx || this.prismaClient;
    const updated = await client.payoutMethod.update({
      where: { id },
      data,
    });
    return updated as unknown as PayoutMethod;
  }

  async delete(id: string, tx?: TransactionClient): Promise<void> {
    const client = tx || this.prismaClient;
    await client.payoutMethod.delete({ where: { id } });
  }
}
