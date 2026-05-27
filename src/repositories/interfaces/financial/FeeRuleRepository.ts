import { FeeRule, FeeRuleCreateInput } from '../../../domain/financial/feeRule.entity.js';

export default interface IFeeRuleRepository {
  findActive(): Promise<FeeRule | null>;
  create(data: FeeRuleCreateInput): Promise<FeeRule>;
}
