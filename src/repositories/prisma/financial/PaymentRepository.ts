import { PrismaClient } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IPaymentRepository } from '../../interfaces/financial/PaymentRepository.js';
import { Payment, PaymentCreateInput } from '../../../domain/financial/payment.entity.js';

export class PaymentRepository extends Repository implements IPaymentRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: PaymentCreateInput, tx?: TransactionClient): Promise<Payment> {
    const client = tx || this.prismaClient;
    const payment = await client.payment.create({
      data: {
        orderId: data.orderId,
        webhookEventId: data.webhookEventId,
        idempotencyKey: data.idempotencyKey,
        externalReferenceId: data.externalReferenceId,
        amount: data.amount,
        currency: data.currency,
      },
    });
    return payment as unknown as Payment;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await this.prismaClient.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return payment ? (payment as unknown as Payment) : null;
  }
}
