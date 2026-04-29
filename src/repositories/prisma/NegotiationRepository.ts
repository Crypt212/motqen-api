import { Prisma } from '../../generated/prisma/client.js';
import { handlePrismaError, Repository } from './Repository.js';
import INegotiationRepository from '../interfaces/NegotiationRepository.js';
import {
  Negotiation,
  NegotiationCreateInput,
  NegotiationFilter,
  NegotiationUpdateInput,
} from '../../domain/negotiation.entity.js';

type PrismaNegotiation = Prisma.NegotiationGetPayload<{}>;

export default class NegotiationRepository extends Repository implements INegotiationRepository {
  private toDomain(record: PrismaNegotiation): Negotiation {
    return {
      id: record.id,
      orderId: record.orderId,
      price: record.price,
      direction: record.direction,
      status: record.status,
      senderId: record.senderId,
      acceptedBy: record.acceptedBy,
      note: record.note,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async find({ filter }: { filter: NegotiationFilter }): Promise<Negotiation | null> {
    try {
      const record = await this.prismaClient.negotiation.findFirst({ where: filter });
      if (!record) return null;
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'find negotiation');
    }
  }

  async findMany({ filter }: { filter: NegotiationFilter }): Promise<Negotiation[]> {
    try {
      const records = await this.prismaClient.negotiation.findMany({ where: filter });
      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw handlePrismaError(error, 'find many negotiations');
    }
  }

  async create({ negotiation }: { negotiation: NegotiationCreateInput }): Promise<Negotiation> {
    try {
      const record = await this.prismaClient.negotiation.create({ data: negotiation });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'create negotiation');
    }
  }

  async update({
    filter,
    negotiation,
  }: {
    filter: NegotiationFilter;
    negotiation: NegotiationUpdateInput;
  }): Promise<Negotiation> {
    try {
      const existing = await this.prismaClient.negotiation.findFirst({ where: filter });
      if (!existing) throw new Error('Negotiation not found for update');

      const record = await this.prismaClient.negotiation.update({
        where: { id: existing.id },
        data: negotiation,
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'update negotiation');
    }
  }
}
