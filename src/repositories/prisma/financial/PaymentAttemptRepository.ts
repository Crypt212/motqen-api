import { PrismaClient } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IPaymentAttemptRepository } from '../../interfaces/financial/PaymentAttemptRepository.js';
import { PaymentAttempt, PaymentAttemptCreateInput } from '../../../domain/financial/payment.entity.js';

export class PaymentAttemptRepository extends Repository implements IPaymentAttemptRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: PaymentAttemptCreateInput, tx?: TransactionClient): Promise<PaymentAttempt> {
    const client = tx || this.prismaClient;
    const attempt = await client.paymentAttempt.create({
      data: {
        orderId: data.orderId,
        paymentId: data.paymentId,
        webhookEventId: data.webhookEventId,
        status: data.status,
        providerResponseCode: data.providerResponseCode,
        providerResponseMessage: data.providerResponseMessage,
        amount: data.amount,
      },
    });
    return attempt as unknown as PaymentAttempt;
  }

  async findByOrderId(orderId: string): Promise<PaymentAttempt[]> {
    const attempts = await this.prismaClient.paymentAttempt.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
    return attempts as unknown as PaymentAttempt[];
  }
}
