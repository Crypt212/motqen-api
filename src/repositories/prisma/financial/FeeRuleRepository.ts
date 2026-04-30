import { PrismaClient, FeeRule as PrismaFeeRule } from '../../../generated/prisma/client.js';
import { handlePrismaError, Repository } from '../Repository.js';
import IFeeRuleRepository from '../../interfaces/financial/FeeRuleRepository.js';
import { FeeRule, FeeRuleCreateInput } from '../../../domain/financial/feeRule.entity.js';

export default class FeeRuleRepository extends Repository implements IFeeRuleRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: PrismaFeeRule): FeeRule {
    return {
      id: record.id,
      percentage: record.percentage,
      effectiveFrom: record.effectiveFrom,
      isActive: record.isActive,
      description: record.description,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async findActive(): Promise<FeeRule | null> {
    try {
      const record = await this.prismaClient.feeRule.findFirst({
        where: { isActive: true },
        orderBy: { effectiveFrom: 'desc' },
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findActive FeeRule');
    }
  }

  async create(data: FeeRuleCreateInput): Promise<FeeRule> {
    try {
      const record = await this.prismaClient.feeRule.create({
        data,
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create FeeRule');
    }
  }
}
