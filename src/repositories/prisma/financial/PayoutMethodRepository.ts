import { PrismaClient } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IPayoutMethodRepository } from '../../interfaces/financial/PayoutMethodRepository.js';
import { PayoutMethod, PayoutMethodCreateInput } from '../../../domain/financial/withdrawal.entity.js';

export class PayoutMethodRepository extends Repository implements IPayoutMethodRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: PayoutMethodCreateInput, tx?: TransactionClient): Promise<PayoutMethod> {
    const client = tx || this.prismaClient;
    const method = await client.payoutMethod.create({
      data: {
        workerProfileId: data.workerProfileId,
        methodType: data.methodType,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
      },
    });
    return method as unknown as PayoutMethod;
  }

  async findByWorkerId(workerProfileId: string): Promise<PayoutMethod[]> {
    const methods = await this.prismaClient.payoutMethod.findMany({
      where: { workerProfileId },
    });
    return methods as unknown as PayoutMethod[];
  }

  async findById(id: string): Promise<PayoutMethod | null> {
    const method = await this.prismaClient.payoutMethod.findUnique({
      where: { id },
    });
    return method as unknown as PayoutMethod | null;
  }
}
