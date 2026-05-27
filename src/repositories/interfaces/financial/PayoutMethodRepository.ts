import type { TransactionClient } from '../../prisma/Repository.js';
import { PayoutMethod, PayoutMethodCreateInput } from '../../../domain/financial/withdrawal.entity.js';

export type PayoutMethodUpdateInput = Partial<Pick<PayoutMethod, 'methodType' | 'accountName' | 'accountNumber' | 'bankName'>>;

export interface IPayoutMethodRepository {
  create(data: PayoutMethodCreateInput, tx?: TransactionClient): Promise<{ created: boolean; payoutMethod: PayoutMethod }>;
  findByWorkerId(workerProfileId: string): Promise<PayoutMethod[]>;
  findById(id: string, tx?: TransactionClient): Promise<PayoutMethod | null>;
  update(id: string, data: PayoutMethodUpdateInput, tx?: TransactionClient): Promise<PayoutMethod>;
  delete(id: string, tx?: TransactionClient): Promise<void>;

}
