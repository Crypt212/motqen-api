import type { TransactionClient } from '../../prisma/Repository.js';
import { Payment, PaymentCreateInput } from '../../../domain/financial/payment.entity.js';

export interface IPaymentRepository {
  create(data: PaymentCreateInput, tx?: TransactionClient): Promise<Payment>;
  findByOrderId(orderId: string): Promise<Payment | null>;
}
