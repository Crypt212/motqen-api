import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import { handlePrismaError, Repository } from './Repository.js';
import IProposalRepository from '../interfaces/ProposalRepository.js';
import {
  Proposal,
  ProposalWithWorkerSummary,
  ProposalCreateInput,
  ProposalFilter,
  ProposalStatus,
} from '../../domain/proposal.entity.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';
import { IDType } from '../interfaces/Repository.js';

export default class ProposalRepository extends Repository implements IProposalRepository {
  constructor(prisma: PrismaClient | Prisma.TransactionClient) {
    super(prisma);
  }

  private toDomain(record: any): Proposal {
    return {
      id: record.id,
      orderId: record.orderId,
      workerProfileId: record.workerProfileId,
      status: record.status as ProposalStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainWithWorkerSummary(record: any): ProposalWithWorkerSummary {
    const latestNegotiation = record.negotiations && record.negotiations.length > 0
      ? record.negotiations[0]
      : null;

    return {
      ...this.toDomain(record),
      workerProfile: {
        id: record.workerProfile.id,
        userId: record.workerProfile.user.id,
        firstName: record.workerProfile.user.firstName,
        lastName: record.workerProfile.user.lastName,
        profileImageUrl: record.workerProfile.user.profileImageUrl,
        experienceYears: record.workerProfile.experienceYears,
        rate: record.workerProfile.rate,
        ratingCount: record.workerProfile.ratingCount,
        completedJobsCount: record.workerProfile.completedJobsCount,
      },
      latestNegotiation: latestNegotiation ? {
        id: latestNegotiation.id,
        price: latestNegotiation.price,
        status: latestNegotiation.status,
        direction: latestNegotiation.direction,
        startDate: latestNegotiation.startDate,
        estimatedDurationHours: latestNegotiation.estimatedDurationHours,
        createdAt: latestNegotiation.createdAt,
      } : null,
    };
  }

  private prepareFilter(filter: ProposalFilter): Prisma.ProposalWhereInput {
    const prepared: Prisma.ProposalWhereInput = {};
    if (filter?.id) prepared.id = filter.id as string;
    if (filter?.orderId) prepared.orderId = filter.orderId as string;
    if (filter?.workerProfileId) prepared.workerProfileId = filter.workerProfileId as string;
    if (filter?.status) prepared.status = filter.status as any;
    if (filter?.createdAt) prepared.createdAt = filter.createdAt as any;
    return prepared;
  }

  async find({ filter }: { filter: ProposalFilter }): Promise<Proposal | null> {
    try {
      const record = await this.prismaClient.proposal.findFirst({
        where: this.prepareFilter(filter),
      });
      if (!record) return null;
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'find proposal');
    }
  }

  async findMany({
    filter,
    pagination,
    sort,
  }: {
    filter: ProposalFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Proposal>;
  }): Promise<PaginatedResultMeta & { proposals: Proposal[] }> {
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
        const total = await this.prismaClient.proposal.count({ where: preparedFilter });
        const handled = handlePagination({ total, paginationOptions: pagination });
        paginationQuery = handled.paginationQuery;
        paginationResult = handled.paginationResult;
      }

      const orderBy = sort ? handleSort(sort) : undefined;

      const records = await this.prismaClient.proposal.findMany({
        where: preparedFilter,
        ...paginationQuery,
        orderBy,
      });

      return {
        ...paginationResult,
        proposals: records.map((r) => this.toDomain(r)),
      };
    } catch (error) {
      throw handlePrismaError(error, 'find many proposals');
    }
  }

  async findManyWithWorkerSummary({
    filter,
    pagination,
    sort,
  }: {
    filter: ProposalFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Proposal>;
  }): Promise<PaginatedResultMeta & { proposals: ProposalWithWorkerSummary[] }> {
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
        const total = await this.prismaClient.proposal.count({ where: preparedFilter });
        const handled = handlePagination({ total, paginationOptions: pagination });
        paginationQuery = handled.paginationQuery;
        paginationResult = handled.paginationResult;
      }

      const orderBy = sort ? handleSort(sort) : undefined;

      const records = await this.prismaClient.proposal.findMany({
        where: preparedFilter,
        include: {
          workerProfile: {
            include: {
              user: true,
            },
          },
          negotiations: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        ...paginationQuery,
        orderBy,
      });

      return {
        ...paginationResult,
        proposals: records.map((r) => this.toDomainWithWorkerSummary(r)),
      };
    } catch (error) {
      throw handlePrismaError(error, 'find many proposals with worker summary');
    }
  }

  async create({ proposal }: { proposal: ProposalCreateInput }): Promise<Proposal> {
    try {
      const record = await this.prismaClient.proposal.create({
        data: {
          order: { connect: { id: proposal.orderId } },
          workerProfile: { connect: { id: proposal.workerProfileId } },
        },
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'create proposal');
    }
  }

  async updateStatus({
    filter,
    status,
  }: {
    filter: ProposalFilter;
    status: ProposalStatus;
  }): Promise<Proposal> {
    try {
      const existing = await this.prismaClient.proposal.findFirst({
        where: this.prepareFilter(filter),
      });
      if (!existing) throw new Error('Proposal not found for status update');

      const record = await this.prismaClient.proposal.update({
        where: { id: existing.id },
        data: { status: status as any },
      });
      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'update proposal status');
    }
  }

  async bulkDismiss({ filter }: { filter: ProposalFilter }): Promise<void> {
    try {
      await this.prismaClient.proposal.updateMany({
        where: this.prepareFilter(filter),
        data: { status: 'DISMISSED' },
      });
    } catch (error) {
      throw handlePrismaError(error, 'bulk dismiss proposals');
    }
  }

  async countRecentByWorker({
    workerProfileId,
    since,
  }: {
    workerProfileId: IDType;
    since: Date;
  }): Promise<number> {
    try {
      return await this.prismaClient.proposal.count({
        where: {
          workerProfileId,
          createdAt: {
            gte: since,
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error, 'count recent proposals by worker');
    }
  }
}
