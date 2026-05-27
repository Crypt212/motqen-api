import { $Enums } from '../../generated/prisma/client.js';

export type WebhookEventStatus = $Enums.WebhookEventStatus;
export type PaymentAttemptStatus = $Enums.PaymentAttemptStatus;

export type WebhookEvent = {
  id: string;
  providerEventId: string;
  provider: string;
  eventType: string;
  status: WebhookEventStatus;
  rawPayload: unknown;
  processedAt: Date | null;
  createdAt: Date;
};

export type WebhookEventCreateInput = Omit<WebhookEvent, 'id' | 'processedAt' | 'createdAt' | 'status'> & {
  status?: WebhookEventStatus;
  processedAt?: Date | null;
  failureReason?: string
};

export type Payment = {
  id: string;
  orderId: string;
  webhookEventId: string;
  idempotencyKey: string;
  externalReferenceId: string;
  amount: bigint;
  currency: string;
  createdAt: Date;
};

export type PaymentCreateInput = Omit<Payment, 'id' | 'createdAt'>;

export type PaymentAttempt = {
  id: string;
  orderId: string;
  paymentId: string | null;
  webhookEventId: string;
  status: PaymentAttemptStatus;
  providerResponseCode: string | null;
  providerResponseMessage: string | null;
  amount: bigint;
  createdAt: Date;
};

export type PaymentAttemptCreateInput = Omit<PaymentAttempt, 'id' | 'createdAt'>;
