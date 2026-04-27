import INegotiationRepository from '../interfaces/NegotiationRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  Negotiation,
  NegotiationStatus,
  CreateNegotiationInput,
  OrderForNegotiation,
} from '../../domain/negotiation.entity.js';
import { PaginatedResultMeta } from '../../types/query.js';
import { PrismaClient, Prisma } from '../../generated/prisma/client.js';

export default class NegotiationRepository extends Repository implements INegotiationRepository {
  constructor(prisma: PrismaClient | Prisma.TransactionClient) {
    super(prisma);
  }

  private toDomain(record: {
    id: string;
    orderId: string;
    price: number;
    direction: string;
    status: string;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Negotiation {
    return {
      id: record.id,
      orderId: record.orderId,
      price: record.price,
      direction: record.direction as Negotiation['direction'],
      status: record.status as Negotiation['status'],
      note: record.note,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async findByOrderId(params: {
    orderId: IDType;
    pagination?: { page?: number; limit?: number };
  }): Promise<PaginatedResultMeta & { negotiations: Negotiation[] }> {
    try {
      const { orderId, pagination } = params;
      const page = pagination?.page ?? 1;
      const limit = pagination?.limit ?? 20;
      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        this.prismaClient.negotiation.findMany({
          where: { orderId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prismaClient.negotiation.count({ where: { orderId } }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        negotiations: records.map((r) => this.toDomain(r)),
        page,
        limit,
        count: records.length,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findByOrderId');
    }
  }

  async findLatestByOrderId(params: { orderId: IDType }): Promise<Negotiation | null> {
    try {
      const record = await this.prismaClient.negotiation.findFirst({
        where: { orderId: params.orderId },
        orderBy: { createdAt: 'desc' },
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findLatestByOrderId');
    }
  }

  async create(params: { data: CreateNegotiationInput }): Promise<Negotiation> {
    try {
      const { data } = params;
      const record = await this.prismaClient.negotiation.create({
        data: {
          orderId: data.orderId,
          price: data.price,
          direction: data.direction,
          note: data.note ?? null,
          status: 'PENDING',
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create negotiation');
    }
  }

  async updateStatus(params: { id: IDType; status: NegotiationStatus }): Promise<Negotiation> {
    try {
      const record = await this.prismaClient.negotiation.update({
        where: { id: params.id },
        data: { status: params.status },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateStatus negotiation');
    }
  }

  async findOrderWithProfiles(params: { orderId: IDType }): Promise<OrderForNegotiation | null> {
    try {
      const record = await this.prismaClient.order.findUnique({
        where: { id: params.orderId },
        select: {
          id: true,
          clientProfileId: true,
          workerProfileId: true,
          orderStatus: true,
        },
      });
      return record
        ? {
            id: record.id,
            clientProfileId: record.clientProfileId,
            workerProfileId: record.workerProfileId,
            orderStatus: record.orderStatus,
          }
        : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findOrderWithProfiles');
    }
  }
}
