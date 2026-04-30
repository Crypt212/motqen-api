import { Prisma } from '../../../generated/prisma/client.js';
import { Dispute, DisputeCreateInput, DisputeStatus } from '../../../domain/financial/dispute.entity.js';

export type TransactionClient = Prisma.TransactionClient;

export default interface IDisputeRepository {
  create(data: DisputeCreateInput, tx?: TransactionClient): Promise<Dispute>;
  findById(id: string): Promise<Dispute | null>;
  findByOrderId(orderId: string): Promise<Dispute | null>;
  findAll(filters?: { status?: DisputeStatus; orderId?: string }, limit?: number, offset?: number): Promise<Dispute[]>;
  updateStatus(id: string, status: DisputeStatus, data?: Partial<Dispute>, tx?: TransactionClient): Promise<Dispute>;
  addMessage(disputeId: string, senderId: string, content: string, tx?: TransactionClient): Promise<any>;
  getMessages(disputeId: string): Promise<any[]>;
}
