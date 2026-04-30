import { PrismaClient, TransactionLog as PrismaTransactionLog } from '../../../generated/prisma/client.js';
import { Repository } from '../Repository.js';
import ITransactionLogRepository, { TransactionClient } from '../../interfaces/financial/TransactionLogRepository.js';
import { TransactionLog, TransactionLogCreateInput } from '../../../domain/financial/transactionLog.entity.js';

export default class TransactionLogRepository extends Repository implements ITransactionLogRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: PrismaTransactionLog): TransactionLog {
    return {
      id: record.id,
      userId: record.userId,
      amount: record.amount,
      type: record.type,
      referenceId: record.referenceId,
      referenceType: record.referenceType,
      description: record.description,
      createdAt: record.createdAt,
    };
  }

  async create(data: TransactionLogCreateInput, tx?: TransactionClient): Promise<TransactionLog> {
    const client = tx || this.prismaClient;
    const record = await client.transactionLog.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        description: data.description,
      },
    });
    return this.toDomain(record);
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<TransactionLog[]> {
    const records = await this.prismaClient.transactionLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByReference(referenceId: string, referenceType: string): Promise<TransactionLog[]> {
    const records = await this.prismaClient.transactionLog.findMany({
      where: { referenceId, referenceType },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }
}
