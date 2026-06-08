import { PrismaClient, Dispute as PrismaDispute } from '../../../generated/prisma/client.js';
import { Repository } from '../Repository.js';
import IDisputeRepository, { TransactionClient } from '../../interfaces/financial/DisputeRepository.js';
import { Dispute, DisputeCreateInput, DisputeStatus } from '../../../domain/financial/dispute.entity.js';

export default class DisputeRepository extends Repository implements IDisputeRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: PrismaDispute): Dispute {
    return {
      id: record.id,
      orderId: record.orderId,
      openedBy: record.openedBy,
      status: record.status as DisputeStatus,
      resolution: record.resolution as any,
      resolutionNote: record.resolutionNote,
      resolvedBy: record.resolvedBy,
      resolvedAt: record.resolvedAt,
      evidence: record.evidence as unknown[],
      flaggedMessageIds: record.flaggedMessageIds,
      eventTimeline: record.eventTimeline as unknown[],
      linkedTransactionLogIds: record.linkedTransactionLogIds,
      assignedDepartment: record.assignedDepartment,
      assignedAdminId: record.assignedAdminId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async create(data: DisputeCreateInput, tx?: TransactionClient): Promise<Dispute> {
    const client = tx || this.prismaClient;
    const record = await client.dispute.create({
      data: {
        orderId: data.orderId,
        openedBy: data.openedBy,
        evidence: (data.evidence || []) as any,
        flaggedMessageIds: data.flaggedMessageIds || [],
        eventTimeline: (data.eventTimeline || []) as any,
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Dispute | null> {
    const record = await this.prismaClient.dispute.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByOrderId(orderId: string): Promise<Dispute | null> {
    const record = await this.prismaClient.dispute.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(filters?: { status?: DisputeStatus; orderId?: string }, limit = 20, offset = 0): Promise<Dispute[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;

    const records = await this.prismaClient.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => this.toDomain(r));
  }

  async updateStatus(id: string, status: DisputeStatus, data?: Partial<Dispute>, tx?: TransactionClient): Promise<Dispute> {
    const client = tx || this.prismaClient;
    const record = await client.dispute.update({
      where: { id },
      data: {
        status,
        resolution: data?.resolution,
        resolutionNote: data?.resolutionNote,
        resolvedBy: data?.resolvedBy,
        resolvedAt: data?.resolvedAt,
        linkedTransactionLogIds: data?.linkedTransactionLogIds,
      },
    });
    return this.toDomain(record);
  }

  async addMessage(disputeId: string, senderId: string, content: string, tx?: TransactionClient): Promise<any> {
    const client = tx || this.prismaClient;
    return client.disputeMessage.create({
      data: { disputeId, senderId, content },
    });
  }

  async getMessages(disputeId: string): Promise<any[]> {
    return this.prismaClient.disputeMessage.findMany({
      where: { disputeId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
