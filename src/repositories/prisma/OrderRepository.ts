import { Prisma } from '../../generated/prisma/client.js';
import { handlePrismaError, Repository } from './Repository.js';
import IOrderRepository from '../interfaces/OrderRepository.js';
import {
  Order,
  OrderCreateInput,
  OrderFilter,
  OrderUpdateInput,
} from '../../domain/order.entity.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';

type PrismaOrderWithImagesWithLocationAndSubSpecialization = Prisma.OrderGetPayload<{
  include: { images: true; subSpecialization: true };
}>;

export default class OrderRepository extends Repository implements IOrderRepository {
  private toDomain(record: PrismaOrderWithImagesWithLocationAndSubSpecialization): Order {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      clientProfileId: record.clientProfileId,
      workerProfileId: record.workerProfileId,
      locationId: record.locationId,
      subSpecialization: record.subSpecialization,
      orderStatus: record.orderStatus,
      workStatus: record.workStatus,
      finalPrice: record.finalPrice,
      startDate: record.startDate,
      endDate: record.endDate,
      isUrgent: record.isUrgent,
      rate: record.rate,
      comment: record.comment,
      workStartedAt: record.workStartedAt,
      workFinishedAt: record.workFinishedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      images:
        record.images?.map((i: { imageUrl: string } | string) =>
          typeof i === 'string' ? i : i.imageUrl
        ) ?? [],
    };
  }

  async find({ filter }: { filter: OrderFilter }): Promise<Order | null> {
    try {
      const record = await this.prismaClient.order.findFirst({
        where: filter,
        include: { images: true, subSpecialization: true },
      });
      if (!record) return null;
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'find order');
    }
  }

  async findMany({
    filter,
    pagination,
    sort,
  }: {
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
  }): Promise<PaginatedResultMeta & { orders: Order[] }> {
    try {
      let paginationQuery: { skip?: number; take?: number } = {};
      let paginationResult: PaginatedResultMeta = {
        page: 1,
        limit: 10,
        count: 0,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      if (pagination) {
        const total = await this.prismaClient.order.count({ where: filter });
        const handled = handlePagination({ total, paginationOptions: pagination });
        paginationQuery = handled.paginationQuery;
        paginationResult = handled.paginationResult;
      }

      const orderBy = sort ? handleSort(sort) : undefined;

      const records = await this.prismaClient.order.findMany({
        where: filter,
        include: { images: true, subSpecialization: true },
        ...paginationQuery,
        orderBy,
      });

      return {
        ...paginationResult,
        orders: records.map((r) => this.toDomain(r)),
      };
    } catch (error) {
      throw handlePrismaError(error, 'find many orders');
    }
  }

  async create({
    order,
    imageUrls,
  }: {
    order: OrderCreateInput;
    imageUrls: string[];
  }): Promise<Order> {
    try {
      const record = await this.prismaClient.order.create({
        data: {
          title: order.title,
          description: order.description,
          location: { connect: { id: order.locationId } },
          subSpecialization: { connect: { id: order.subSpecializationId } },
          startDate: order.startDate,
          isUrgent: order.isUrgent,

          clientProfile: { connect: { userId: order.clientUserId } },
          workerProfile: { connect: { userId: order.workerUserId } },

          images: {
            createMany: {
              data: imageUrls.map((url) => ({ imageUrl: url })),
            },
          },
        },
        include: { images: true, subSpecialization: true },
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'create order');
    }
  }

  async update({
    filter,
    order,
  }: {
    filter: OrderFilter;
    order: OrderUpdateInput;
  }): Promise<Order> {
    try {
      // First, get the ID from filter, assuming updating by ID
      const existing = await this.prismaClient.order.findFirst({ where: filter });
      if (!existing) throw new Error('Order not found for update');

      const record = await this.prismaClient.order.update({
        where: { id: existing.id },
        data: order,
        include: { images: true, subSpecialization: true },
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'update order');
    }
  }

  async delete({ filter }: { filter: OrderFilter }): Promise<void> {
    try {
      await this.prismaClient.order.deleteMany({
        where: filter,
      });
    } catch (error) {
      throw handlePrismaError(error, 'delete order');
    }
  }
}
