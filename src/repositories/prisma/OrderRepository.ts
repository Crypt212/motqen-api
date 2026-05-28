import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import { handlePrismaError, Repository } from './Repository.js';
import IOrderRepository from '../interfaces/OrderRepository.js';
import {
  Order,
  OrderCreateInput,
  OrderFilter,
  OrderStatus,
  OrderUpdateInput,
  OrderMode,
} from '../../domain/order.entity.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';
import { ClientProfileFilter } from 'src/domain/clientProfile.entity.js';
import { WorkerProfileFilter } from 'src/domain/workerProfile.entity.js';

type PrismaOrderWithImagesWithLocationAndSubSpecialization = Prisma.OrderGetPayload<{
  include: { images: true; subSpecialization: true, clientProfile: { include: { user: true } }, workerProfile: { include: { user: true } } };
}>;

type PrismaOrderFilter = {
  id?: string,
  clientProfileId?: string,
  workerProfileId?: string,
  clientProfile?: ClientProfileFilter,
  workerProfile?: WorkerProfileFilter,
  rate?: number,
  orderStatus?: OrderStatus,
  isUrgent?: boolean,
  createdAt?: Date,
  orderMode?: OrderMode
};

export default class OrderRepository extends Repository implements IOrderRepository {
  constructor(prisma: PrismaClient | Prisma.TransactionClient) {
    super(prisma);
  }

  private toDomain(record: PrismaOrderWithImagesWithLocationAndSubSpecialization): Order {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      clientUserId: record.clientProfile.userId,
      workerUserId: record.workerProfile?.userId ?? null,
      locationId: record.locationId,
      subSpecialization: record.subSpecialization,
      orderStatus: record.orderStatus,
      workStatus: record.workStatus,
      initialPrice: record.initialPrice,
      finalPrice: record.finalPrice,
      startDate: record.startDate,
      estimatedDurationHours: record.estimatedDurationHours,
      isUrgent: record.isUrgent,
      rate: record.rate,
      comment: record.comment ?? undefined,
      workStartedAt: record.workStartedAt,
      workFinishedAt: record.workFinishedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      images:
        record.images?.map((i: { imageUrl: string } | string) =>
          typeof i === 'string' ? i : i.imageUrl
        ) ?? [],
      orderMode: record.orderMode as any,
    };
  }

  private prepareFilter(filter: OrderFilter): PrismaOrderFilter {
    const preparedFilter: PrismaOrderFilter = {
      id: filter?.id as string,
      clientProfile: filter.clientUserId ? { userId: filter.clientUserId as string } : undefined,
      workerProfile: filter.workerUserId ? { userId: filter.workerUserId as string } : undefined,
      rate: filter?.rate as number,
      orderStatus: filter?.orderStatus as OrderStatus,
      isUrgent: filter?.isUrgent as boolean,
      createdAt: filter?.createdAt as Date,
      orderMode: filter?.orderMode as OrderMode

    };
    return preparedFilter;
  }

  async find({ filter }: { filter: OrderFilter }): Promise<Order | null> {
    try {
      const preparedFilter = this.prepareFilter(filter);
      const record = await this.prismaClient.order.findFirst({
        where: preparedFilter,
        include: { images: true, subSpecialization: true, clientProfile: { include: { user: true } }, workerProfile: { include: { user: true } } }
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

      const preparedFilter = this.prepareFilter(filter);

      if (pagination) {
        const total = await this.prismaClient.order.count({ where: preparedFilter });
        const handled = handlePagination({ total, paginationOptions: pagination });
        paginationQuery = handled.paginationQuery;
        paginationResult = handled.paginationResult;
      }

      const orderBy = sort ? handleSort(sort) : undefined;

      const records = await this.prismaClient.order.findMany({
        where: preparedFilter,
        include: { images: true, subSpecialization: true, clientProfile: { include: { user: true } }, workerProfile: { include: { user: true } } },
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
          startDate: order.startDate ?? undefined,
          initialPrice: order.initialPrice,
          estimatedDurationHours: order.estimatedDurationHours,
          isUrgent: order.isUrgent,
          orderMode: (order.orderMode as any) ?? 'DIRECT',
          orderStatus: order.orderMode === 'GLOBAL' ? 'OPEN' : 'PENDING',

          clientProfile: { connect: { userId: order.clientUserId } },
          workerProfile: order.workerUserId ? { connect: { userId: order.workerUserId } } : undefined,

          images: {
            createMany: {
              data: imageUrls.map((url) => ({ imageUrl: url })),
            },
          },
        },
        include: { images: true, subSpecialization: true, workerProfile: { include: { user: true } }, clientProfile: { include: { user: true } } }
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
      const preparedFilter = this.prepareFilter(filter);

      // First, get the ID from filter, assuming updating by ID
      const existing = await this.prismaClient.order.findFirst({ where: preparedFilter });
      if (!existing) throw new Error('Order not found for update');

      const dataToUpdate: any = { ...order };
      if (order.workerUserId !== undefined) {
        dataToUpdate.workerProfile = order.workerUserId
          ? { connect: { userId: order.workerUserId } }
          : { disconnect: true };
        delete dataToUpdate.workerUserId;
      }

      const record = await this.prismaClient.order.update({
        where: { id: existing.id },
        data: dataToUpdate,
        include: { images: true, subSpecialization: true, workerProfile: { include: { user: true } }, clientProfile: { include: { user: true } } },
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'update order');
    }
  }

  async delete({ filter }: { filter: OrderFilter }): Promise<void> {
    try {
      const preparedFilter = this.prepareFilter(filter);

      await this.prismaClient.order.deleteMany({
        where: preparedFilter,
      });
    } catch (error) {
      throw handlePrismaError(error, 'delete order');
    }
  }

  async findForProposalAcceptance({ orderId }: { orderId: string }): Promise<Order | null> {
    try {
      const record = await this.prismaClient.order.findUnique({
        where: { id: orderId },
        include: { images: true, subSpecialization: true, clientProfile: { include: { user: true } }, workerProfile: { include: { user: true } } }
      });
      if (!record) return null;
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'find order for proposal acceptance');
    }
  }
}
