import { PrismaClient, Prisma } from '../../../generated/prisma/client.js';
import { Repository, TransactionClient } from '../Repository.js';
import { IWebhookEventRepository } from '../../interfaces/financial/WebhookEventRepository.js';
import { WebhookEvent, WebhookEventCreateInput, WebhookEventStatus } from '../../../domain/financial/payment.entity.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';

export class WebhookEventRepository extends Repository implements IWebhookEventRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: WebhookEventCreateInput, tx?: TransactionClient):Promise<{created : boolean ,event :WebhookEvent}> {
    const client = tx || this.prismaClient;
    try {
      const event = await client.webhookEvent.create({
        data: {
          providerEventId: data.providerEventId,
          provider: data.provider,
          eventType: data.eventType,
          status: data.status,
          rawPayload: data.rawPayload as object,
          processedAt: data.processedAt,
          failureReason: data.failureReason
        },
      });
      return { created: true, event: event  };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await client.webhookEvent.findUnique({
          where: { providerEventId: data.providerEventId },
        });
        if (existing) {
          return { created: false, event: existing  };
        }
      }
      throw error;
    }
  }

  async findByProviderEventId(providerEventId: string): Promise<WebhookEvent | null> {
    const event = await this.prismaClient.webhookEvent.findUnique({
      where: { providerEventId },
    });
    return event ? (event as unknown as WebhookEvent) : null;
  }

  async updateStatus(id: string, status: WebhookEventStatus, tx?: TransactionClient): Promise<WebhookEvent> {
    const client = tx || this.prismaClient;
    const event = await client.webhookEvent.update({
      where: { id },
      data: { status },
    });
    return event as unknown as WebhookEvent;
  }
  async update(id: IDType, data: any, tx?: TransactionClient):Promise<WebhookEvent> {
    const client = tx || this.prismaClient;
    const event = await client.webhookEvent.update({
      where: { id },
      data: data,
    });
    return event 
  }
}
