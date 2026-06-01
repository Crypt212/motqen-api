import { Prisma, PrismaClient, ReportStatus } from '../../generated/prisma/client.js';
import { Repository } from './Repository.js';
import IReportRepository from '../interfaces/ReportRepository.js';
import {
  ReportFilter,
  ReportCreateInput,
  ReportUpdateInput,
  ReportStatusUpdateInput,
  ReportWithImages,
  ReportTargetType,
  ProblemCategory,
} from '../../domain/report.entity.js';
import { handlePrismaError } from './Repository.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';

const REPORT_INCLUDE = {
  images: {
    select: { url: true },
  },
} as const;

type ReportRecord = Prisma.ReportGetPayload<{ include: typeof REPORT_INCLUDE }>;

export default class ReportRepository extends Repository implements IReportRepository {
  constructor(prisma: PrismaClient | Prisma.TransactionClient) {
    super(prisma);
  }
  private toDomain(record: ReportRecord): ReportWithImages {
    return {
      id: record.id,
      reporterId: record.reporterId,
      targetType: record.targetType,
      targetId: record.targetId,
      contextOrderId: record.contextOrderId,
      problemCategory: record.problemCategory,
      problemType: record.problemType,
      description: record.description,
      status: record.status,
      resolvedBy: record.resolvedBy,
      retainUntil: record.retainUntil,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      assignedDepartment: record.assignedDepartment,
      assignedAdminId: record.assignedAdminId,
      images: record.images.map((image) => image.url),
    };
  }

  async isPendingOrUnderReview(params: {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    problemCategory: ProblemCategory;
  }): Promise<boolean> {
    try {
      const count = await this.prismaClient.report.count({
        where: {
          reporterId: params.reporterId,
          targetType: params.targetType,
          targetId: params.targetId,
          problemCategory: params.problemCategory,
          status: {
            in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW],
          },
        },
      });
      return count > 0;
    } catch (error) {
      throw handlePrismaError(error, 'isPendingOrUnderReview');
    }
  }

  async countRecentReports(params: { reporterId: string; since: Date }): Promise<number> {
    try {
      const count = await this.prismaClient.report.count({
        where: {
          reporterId: params.reporterId,
          createdAt: { gte: params.since },
        },
      });
      return count;
    } catch (error) {
      throw handlePrismaError(error, 'countRecentReports');
    }
  }

  async findById(params: { id: string }): Promise<ReportWithImages | null> {
    try {
      const record = await this.prismaClient.report.findUnique({
        where: { id: params.id },
        include: REPORT_INCLUDE,
      });

      return record ? this.toDomain(record) : null;
    } catch (error) {
      throw handlePrismaError(error, 'findById');
    }
  }

  async findMany(params: {
    filter: ReportFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<ReportWithImages>;
  }): Promise<PaginatedResultMeta & { reports: ReportWithImages[] }> {
    try {
      const { filter, pagination, sort } = params;

      const total = await this.prismaClient.report.count({ where: filter });

      const sortQuery = handleSort(sort);
      const { paginationQuery, paginationResult } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const [records] = await Promise.all([
        this.prismaClient.report.findMany({
          where: filter,
          ...paginationQuery,
          orderBy: sortQuery,
          include: REPORT_INCLUDE,
        }),
      ]);

      return {
        reports: records.map((record) => this.toDomain(record)),
        ...paginationResult,
        total,
        count: records.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error) {
      throw handlePrismaError(error, 'findMany');
    }
  }

  async create(params: { report: ReportCreateInput }): Promise<ReportWithImages> {
    try {
      const record = await this.prismaClient.report.create({
        data: {
          reporterId: params.report.reporterId,
          targetType: params.report.targetType,
          targetId: params.report.targetId,
          contextOrderId: params.report.contextOrderId,
          problemCategory: params.report.problemCategory,
          problemType: params.report.problemType,
          description: params.report.description,
          images: params.report.imageUrls
            ? {
                create: params.report.imageUrls.map((url) => ({ url })),
              }
            : undefined,
        },
        include: REPORT_INCLUDE,
      });

      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'create');
    }
  }

  async updateById(params: { id: string; report: ReportUpdateInput }): Promise<ReportWithImages> {
    try {
      const existing = await this.prismaClient.report.findUnique({
        where: { id: params.id },
        select: { id: true },
      });

      if (!existing) {
        throw new Error('Report not found for update');
      }

      const updatedRecord = await this.prismaClient.$transaction(async (tx) => {
        if (params.report.imageUrls !== undefined) {
          await tx.reportImage.deleteMany({
            where: { reportId: existing.id },
          });
        }

        return tx.report.update({
          where: { id: existing.id },
          data: {
            description: params.report.description,
            ...(params.report.imageUrls !== undefined
              ? {
                  images: {
                    create: params.report.imageUrls.map((url) => ({ url })),
                  },
                }
              : {}),
          },
          include: REPORT_INCLUDE,
        });
      });

      return this.toDomain(updatedRecord);
    } catch (error) {
      throw handlePrismaError(error, 'updateById');
    }
  }

  async updateStatusById(params: {
    id: string;
    status: ReportStatusUpdateInput;
  }): Promise<ReportWithImages> {
    try {
      const existing = await this.prismaClient.report.findUnique({
        where: { id: params.id },
        select: { id: true },
      });

      if (!existing) {
        throw new Error('Report not found for updateStatus');
      }

      const record = await this.prismaClient.report.update({
        where: { id: existing.id },
        data: {
          status: params.status.status,
          resolvedBy: params.status.resolvedBy,
        },
        include: REPORT_INCLUDE,
      });

      return this.toDomain(record);
    } catch (error) {
      throw handlePrismaError(error, 'updateStatusById');
    }
  }
}
