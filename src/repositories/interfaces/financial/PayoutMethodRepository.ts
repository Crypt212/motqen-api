import { TransactionClient } from '../Repository.js';
import { PayoutMethod, PayoutMethodCreateInput } from '../../../domain/financial/withdrawal.entity.js';

export interface IPayoutMethodRepository {
  create(data: PayoutMethodCreateInput, tx?: TransactionClient): Promise<PayoutMethod>;
  findByWorkerId(workerProfileId: string): Promise<PayoutMethod[]>;
  findById(id: string): Promise<PayoutMethod | null>;
}
