import { TransactionClient } from '../Repository.js';
import { PaymentAttempt, PaymentAttemptCreateInput } from '../../../domain/financial/payment.entity.js';

export interface IPaymentAttemptRepository {
  create(data: PaymentAttemptCreateInput, tx?: TransactionClient): Promise<PaymentAttempt>;
  findByOrderId(orderId: string): Promise<PaymentAttempt[]>;
}
