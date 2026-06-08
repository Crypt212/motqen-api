import { OrderMode, Prisma, PrismaClient } from '../../generated/prisma/client.js';
import { handlePrismaError, Repository } from './Repository.js';
import IOrderRepository from '../interfaces/OrderRepository.js';
import {
  Order,
  OrderCreateInput,
  OrderFilter,
  OrderStatus,
  OrderUpdateInput,
} from '../../domain/order.entity.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';
import { ClientProfileFilter } from 'src/domain/clientProfile.entity.js';
import { WorkerProfileFilter } from 'src/domain/workerProfile.entity.js';
import { IDType } from '../interfaces/Repository.js';
import { isEmptyFilter } from './utils.js';

type PrismaOrderWithImagesWithLocationAndSubSpecialization = Prisma.OrderGetPayload<{
  include: {
    images: true;
    subSpecialization: true;
    clientProfile: { include: { user: true } };
    workerProfile: { include: { user: true } };
    location: true;
    disputes: true;
    reports: true;
  };
}>;

type PrismaOrderFilter = {
  id?: string;
  clientProfileId?: string;
  workerProfileId?: string;
  clientProfile?: ClientProfileFilter;
  workerProfile?: WorkerProfileFilter;
  location?: { governmentId?: string };
  subSpecializationId?: string;
  orderReference?: { contains: string; mode: 'insensitive' };
  rate?: number;
  orderStatus?: OrderStatus;
  orderMode?: OrderMode;
  isUrgent?: boolean;
  createdAt?: Date | { gte?: Date; lte?: Date };
};

export default class OrderRepository extends Repository implements IOrderRepository {
  constructor(prisma: PrismaClient | Prisma.TransactionClient) {
    super(prisma);
  }

  private formatFullName(user: { firstName: string; middleName?: string | null; lastName: string }) {
    return [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ').trim();
  }

  private toDomain(record: PrismaOrderWithImagesWithLocationAndSubSpecialization): Order {
    return {
      id: record.id,
      referenceNumber: record.referenceNumber,
      orderReference: record.orderReference ?? '',
      title: record.title,
      description: record.description,
      clientUserId: record.clientProfile.userId,
      workerUserId: record.workerProfile?.userId ?? null,
      locationId: record.locationId,
      subSpecialization: record.subSpecialization,
      orderStatus: record.orderStatus,
      workStatus: record.workStatus,
      initialPrice: record.initialPrice,
      finalPrice: record.finalPrice ?? null,
      startDate: record.startDate ?? null,
      estimatedDurationHours: record.estimatedDurationHours ?? null,
      isUrgent: record.isUrgent,
      rate: record.rate,
      comment: record.comment ?? null,
      workStartedAt: record.workStartedAt ?? null,
      workFinishedAt: record.workFinishedAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      images:
        record.images?.map((i: { imageUrl: string } | string) =>
          typeof i === 'string' ? i : i.imageUrl
        ) ?? [],
      orderMode: record.orderMode as any,
      clientName: this.formatFullName(record.clientProfile.user),
      workerName: record.workerProfile?.user ? this.formatFullName(record.workerProfile.user) : null,
      disputeExists: Array.isArray((record as any).disputes) ? (record as any).disputes.length > 0 : undefined,
      reportExists: Array.isArray((record as any).reports) ? (record as any).reports.length > 0 : undefined,
    };
  }

  private prepareNameFilter(value: string) {
    return [
      { firstName: { contains: value, mode: 'insensitive' } },
      { middleName: { contains: value, mode: 'insensitive' } },
      { lastName: { contains: value, mode: 'insensitive' } },
    ];
  }

  private prepareFilter(filter: OrderFilter): PrismaOrderFilter {
    const preparedFilter: any = {};

    if (filter?.id) preparedFilter.id = filter.id;
    if (filter?.orderReference) preparedFilter.orderReference = { contains: filter.orderReference as string, mode: 'insensitive' };
    if (filter?.clientUserId) preparedFilter.clientProfile = { userId: filter.clientUserId as string };
    if (filter?.workerUserId) preparedFilter.workerProfile = { userId: filter.workerUserId as string };
    if (filter?.clientName) {
      preparedFilter.clientProfile = {
        ...(preparedFilter.clientProfile || {}),
        user: { OR: this.prepareNameFilter(filter.clientName as string) },
      };
    }
    if (filter?.workerName) {
      preparedFilter.workerProfile = {
        ...(preparedFilter.workerProfile || {}),
        user: { OR: this.prepareNameFilter(filter.workerName as string) },
      };
    }
    if (filter?.governmentId) preparedFilter.location = { governmentId: filter.governmentId as string };
    if (filter?.specializationId) preparedFilter.subSpecializationId = filter.specializationId as string;
    if (filter?.rate !== undefined) preparedFilter.rate = filter.rate as number;
    if (filter?.orderStatus) preparedFilter.orderStatus = filter.orderStatus as OrderStatus;
    if (filter?.isUrgent !== undefined) preparedFilter.isUrgent = filter.isUrgent as boolean;
    if (filter?.orderMode) preparedFilter.orderMode = filter.orderMode as OrderMode;

    if (filter?.createdFrom || filter?.createdTo) {
      preparedFilter.createdAt = {
        ...(filter.createdFrom ? { gte: filter.createdFrom as Date } : {}),
        ...(filter.createdTo ? { lte: filter.createdTo as Date } : {}),
      };
    }

    if (Array.isArray((filter as any).OR)) {
      preparedFilter.OR = (filter as any).OR.map((item: any) => this.prepareFilter(item));
    }

    return preparedFilter;
  }

  async find({ filter }: { filter: OrderFilter }): Promise<Order | null> {
    try {
      const preparedFilter = this.prepareFilter(filter);
      const record = await this.prismaClient.order.findFirst({
        where: preparedFilter,
        include: {
          images: true,
          subSpecialization: true,
          clientProfile: { include: { user: true } },
          workerProfile: { include: { user: true } },
          location: true,
          disputes: true,
          reports: true,
        },
      });
      if (!record) return null;
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'find order');
    }
  }

  async findDetailed(orderId: string) {
    try {
      const record = await this.prismaClient.order.findUnique({
        where: { id: orderId },
        include: {
          images: true,
          subSpecialization: true,
          location: true,
          clientProfile: { include: { user: true } },
          workerProfile: { include: { user: true, verification: true } },
          proposals: {
            include: {
              workerProfile: { include: { user: true } },
              negotiations: {
                include: {
                  sender: true,
                  accepter: true,
                },
              },
            },
          },
          negotiations: {
            include: {
              sender: true,
              accepter: true,
              proposal: true,
            },
          },
          paymentAttempts: true,
          payment: {
            include: {
              escrowHold: true,
            },
          },
          escrowHold: true,
          disputes: {
            include: {
              messages: true,
            },
          },
          reports: {
            include: {
              reporter: true,
            },
          },
        },
      });

      return record;
    } catch (error) {
      throw handlePrismaError(error, 'find detailed order');
    }
  }

  async findMany({
    filter,
    pagination,
    sort,
    includeGlobal
  }: {
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
    includeGlobal?: boolean;
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
        where: includeGlobal ? { OR: [preparedFilter, { orderMode: 'GLOBAL' }] } : preparedFilter,
        include: {
          images: true,
          subSpecialization: true,
          clientProfile: { include: { user: true } },
          workerProfile: { include: { user: true } },
          location: true,
          disputes: true,
          reports: true,
        },
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

  async findForClient({
    clientUserId,
    filter,
    pagination,
    sort,
  }: {
    clientUserId: IDType;
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

      const preparedFilter = {
        ...this.prepareFilter(filter),
        clientProfile: { userId: clientUserId }
      };

      if (pagination) {
        const total = await this.prismaClient.order.count({ where: preparedFilter });
        const handled = handlePagination({ total, paginationOptions: pagination });
        paginationQuery = handled.paginationQuery;
        paginationResult = handled.paginationResult;
      }

      const orderBy = sort ? handleSort(sort) : undefined;

      const records = await this.prismaClient.order.findMany({
        where: preparedFilter,
        include: {
          images: true,
          subSpecialization: true,
          clientProfile: { include: { user: true } },
          workerProfile: { include: { user: true } },
          location: true,
          disputes: true,
          reports: true,
        },
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


  async findForWorker({
    workerUserId,
    workerSubSpecializationIds,
    workerWorkingGovernmentIds,
    filter,
    pagination,
    sort,
  }: {
    workerUserId: IDType;
    workerSubSpecializationIds: IDType[];
    workerWorkingGovernmentIds: IDType[];
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

      const defaultOrderFilter = {
        OR: [
          {
            workerProfile: { userId: workerUserId },
          },
          {
            AND: [
              {
                orderMode: OrderMode.GLOBAL,
              },
              { subSpecializationId: { in: workerSubSpecializationIds } },
              { clientProfile: { user: { locations: { some: { governmentId: { in: workerWorkingGovernmentIds } } } } } },
            ]
          }
        ]
      }

      const preparedFilter =
        isEmptyFilter(filter) ? defaultOrderFilter :
          {
            AND: [
              defaultOrderFilter,
              {
                ...this.prepareFilter(filter),
              }
            ]
          };

      if (pagination) {
        const total = await this.prismaClient.order.count({ where: preparedFilter });
        const handled = handlePagination({ total, paginationOptions: pagination });
        paginationQuery = handled.paginationQuery;
        paginationResult = handled.paginationResult;
      }

      const orderBy = sort ? handleSort(sort) : undefined;

      console.log(JSON.stringify(preparedFilter, null, 4));

      const records = await this.prismaClient.order.findMany({
        where: preparedFilter,
        include: {
          images: true,
          subSpecialization: true,
          clientProfile: { include: { user: true } },
          workerProfile: { include: { user: true } },
          location: true,
          disputes: true,
          reports: true,
        },
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
      const created = await this.prismaClient.$transaction(async (tx) => {
        const record = await tx.order.create({
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
          include: {
            images: true,
            subSpecialization: true,
            workerProfile: { include: { user: true } },
            clientProfile: { include: { user: true } },
            location: true,
            disputes: true,
            reports: true,
          },
        });

        const orderReference = `ORD-${String(record.referenceNumber).padStart(6, '0')}`;

        const updated = await tx.order.update({
          where: { id: record.id },
          data: { orderReference },
          include: {
            images: true,
            subSpecialization: true,
            workerProfile: { include: { user: true } },
            clientProfile: { include: { user: true } },
            location: true,
            disputes: true,
            reports: true,
          },
        });

        return updated;
      });

      return this.toDomain(created);
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
        include: {
          images: true,
          subSpecialization: true,
          workerProfile: { include: { user: true } },
          clientProfile: { include: { user: true } },
          location: true,
          disputes: true,
          reports: true,
        },
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
        include: {
          images: true,
          subSpecialization: true,
          clientProfile: { include: { user: true } },
          workerProfile: { include: { user: true } },
          location: true,
          disputes: true,
          reports: true,
        },
      });
      if (!record) return null;
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'find order for proposal acceptance');
    }
  }

  async findConversationForOrder(orderId: string) {
    try {
      const record = await this.prismaClient.order.findUnique({
        where: { id: orderId },
        include: {
          workerProfile: true,
          clientProfile: true,
        },
      });

      if (!record || !record.workerProfileId) {
        return null;
      }

      const conversation = await this.prismaClient.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: { userId: record.workerProfile?.userId },
              },
            },
            {
              participants: {
                some: { userId: record.clientProfile.userId },
              },
            },
          ],
        },
        include: {
          participants: {
            include: { user: true },
          },
          messages: {
            include: { sender: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return conversation;
    } catch (error) {
      throw handlePrismaError(error, 'find conversation for order');
    }
  }

  async findRefundsForOrder(orderId: string) {
    try {
      const refunds = await this.prismaClient.refund.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });
      return refunds;
    } catch (error) {
      throw handlePrismaError(error, 'find refunds for order');
    }
  }

  async findWithdrawalsForWorker(workerProfileId: string) {
    try {
      const withdrawals = await this.prismaClient.withdrawRequest.findMany({
        where: { workerProfileId },
        include: { payoutMethod: true },
        orderBy: { createdAt: 'desc' },
      });
      return withdrawals;
    } catch (error) {
      throw handlePrismaError(error, 'find withdrawals for worker');
    }
  }
}
