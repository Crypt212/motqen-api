import { IDType } from 'src/repositories/interfaces/Repository.js';

export interface IPaymentProvider {
  verifyWebhookSignature(payload: string, hmacHeader: string): boolean;
  initiateRefund(
    transactionId: string,
    amountInCents: number
  ): Promise<{ success: boolean; refundId?: string; error?: string }>;
  createPaymentIntention(
    orderInfo: { amountCents: number; orderId: string; specialReference?: string },
    billingData: Record<string, unknown>,
    userId: IDType
  ): Promise<string>;
}
