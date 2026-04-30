import { TransactionClient } from '../Repository.js';
import { Refund, RefundCreateInput } from '../../../domain/financial/refund.entity.js';

export interface IRefundRepository {
  create(data: RefundCreateInput, tx?: TransactionClient): Promise<{ created: boolean; refund: Refund }>;
  findByOrderId(orderId: string): Promise<Refund[]>;
  findByIdempotencyKey(key: string): Promise<Refund | null>;
}
