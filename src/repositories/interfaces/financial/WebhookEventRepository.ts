import type { IDType } from '../../interfaces/Repository.js';
import type { TransactionClient } from '../../prisma/Repository.js';
import { WebhookEvent, WebhookEventCreateInput, WebhookEventStatus } from '../../../domain/financial/payment.entity.js';

export interface IWebhookEventRepository {
  create(data: WebhookEventCreateInput, tx?: TransactionClient): Promise<{ created: boolean; existing?: WebhookEvent; event?: WebhookEvent }>;
  findByProviderEventId(id: string): Promise<WebhookEvent | null>;
  updateStatus(id: string, status: WebhookEventStatus, tx?: TransactionClient): Promise<WebhookEvent>;
  update(id: IDType, data: any, tx?: TransactionClient):Promise<WebhookEvent> ;
  
}
