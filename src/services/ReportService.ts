import Service, { tryCatch } from './Service.js';
import IReportRepository from '../repositories/interfaces/ReportRepository.js';
import AppError from '../errors/AppError.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import { canReportTransitionTo, isReporterCancellable } from '../utils/reportStateMachine.js';
import {
  ReportFilter,
  ReportCreateInput,
  ReportUpdateInput,
  ReportWithImages,
} from '../domain/report.entity.js';
import { PaginatedResultMeta, SortOptions, PaginationOptions } from '../types/query.js';
import { ReportStatus } from '../generated/prisma/enums.js';

export default class ReportService extends Service {
  private reportRepository: IReportRepository;

  constructor(dependencies: { reportRepository: IReportRepository }) {
    super();
    this.reportRepository = dependencies.reportRepository;
  }

  async createReport(params: {
    report: ReportCreateInput;
    requesterType: "WORKER" | "CLIENT";
    files?: Express.Multer.File[];
  }): Promise<ReportWithImages> {
    return tryCatch(async () => {
      if (params.report.targetType === "CLIENT_PROFILE" && params.requesterType !== 'WORKER') {
        throw new AppError('Only workers can report client profiles', 403);
      }

      if (params.report.targetType === "WORKER_PROFILE" && params.requesterType !== 'CLIENT') {
        throw new AppError('Only clients can report worker profiles', 403);
      }

      if (params.files && params.files.length > 5) {
        throw new AppError('Maximum of 5 images allowed per report', 400);
      }

      // Check duplicate
      const isDuplicate = await this.reportRepository.isPendingOrUnderReview({
        reporterId: params.report.reporterId,
        targetType: params.report.targetType,
        targetId: params.report.targetId,
        problemCategory: params.report.problemCategory,
      });

      if (isDuplicate) {
        throw new AppError('An active report already exists for this target and category', 409);
      }

      // Check rate limit (10 per 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentCount = await this.reportRepository.countRecentReports({
        reporterId: params.report.reporterId,
        since: oneDayAgo,
      });

      if (recentCount >= 10) {
        throw new AppError('Rate limit exceeded: You can only submit 10 reports per 24 hours', 429);
      }

      // Upload images
      let imageUrls: string[] | undefined = undefined;
      if (params.files && params.files.length > 0) {
        const uploadPromises = params.files.map((file) => uploadToCloudinary(file.buffer, 'motqen/reports'));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map((res) => res.url);
      }

      const input = {
        ...params.report,
        imageUrls,
      };

      return this.reportRepository.create({ report: input });
    });
  }

  async getReports(params: {
    filter: ReportFilter;
    requesterId: string;
    requesterRole: string;
    pagination?: PaginationOptions;
    sort?: SortOptions<ReportWithImages>;
  }): Promise<PaginatedResultMeta & { reports: ReportWithImages[] }> {
    return tryCatch(async () => {
      const finalFilter = { ...params.filter };
      if (params.requesterRole !== 'ADMIN') {
        finalFilter.reporterId = params.requesterId;
      }

      return this.reportRepository.findMany({
        filter: finalFilter,
        pagination: params.pagination,
        sort: params.sort,
      });
    });
  }

  async getReportById(params: {
    reportId: string;
    requesterId: string;
    requesterRole: string;
  }): Promise<ReportWithImages> {
    return tryCatch(async () => {
      const report = await this.reportRepository.findById({
        id: params.reportId,
      });

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      if (params.requesterRole !== 'ADMIN' && report.reporterId !== params.requesterId) {
        throw new AppError('Forbidden', 403);
      }

      return report;
    });
  }

  async updateReport(params: {
    reportId: string;
    requesterId: string;
    requesterRole: string;
    report: ReportUpdateInput;
    files?: Express.Multer.File[];
  }): Promise<ReportWithImages> {
    return tryCatch(async () => {
      const existing = await this.getReportById({
        reportId: params.reportId,
        requesterId: params.requesterId,
        requesterRole: params.requesterRole,
      });

      if (existing.status !== "PENDING") {
        throw new AppError('Only PENDING reports can be edited', 409);
      }

      if (params.files && params.files.length > 5) {
        throw new AppError('Maximum of 5 images allowed per report', 400);
      }

      let imageUrls: string[] | undefined = undefined;
      if (params.files && params.files.length > 0) {
        const uploadPromises = params.files.map((file) => uploadToCloudinary(file.buffer, 'motqen/reports'));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map((res) => res.url);
      }

      const input = {
        ...params.report,
        ...(imageUrls !== undefined ? { imageUrls } : {}),
      };

      return this.reportRepository.updateById({
        id: params.reportId,
        report: input,
      });
    });
  }

  async cancelReport(params: {
    reportId: string;
    requesterId: string;
    requesterRole: string;
  }): Promise<void> {
    return tryCatch(async () => {
      const existing = await this.getReportById({
        reportId: params.reportId,
        requesterId: params.requesterId,
        requesterRole: params.requesterRole,
      });

      if (!isReporterCancellable(existing.status)) {
        throw new AppError('Report cannot be cancelled in its current status', 409);
      }

      await this.reportRepository.updateStatusById({
        id: params.reportId,
        status: { status: "CANCELLED" },
      });
    });
  }

  async updateReportStatus(params: {
    reportId: string;
    status: ReportStatus;
    resolvedBy: string; // adminId
  }): Promise<ReportWithImages> {
    return tryCatch(async () => {
      // getReportById requires requester info for access control.
      // Since this is admin only, we pass resolvedBy as requester and ADMIN role.
      const existing = await this.getReportById({
        reportId: params.reportId,
        requesterId: params.resolvedBy,
        requesterRole: 'ADMIN',
      });

      if (!canReportTransitionTo(existing.status, params.status)) {
        throw new AppError(`Cannot transition report from ${existing.status} to ${params.status}`, 400);
      }

      const isTerminal = params.status === ReportStatus.RESOLVED || params.status === ReportStatus.REJECTED;

      const result = await this.reportRepository.updateStatusById({
        id: params.reportId,
        status: {
          status: params.status,
          resolvedBy: isTerminal ? params.resolvedBy : undefined,
        },
      });

      // Stub: TODO: send notification to user about status change

      return result;
    });
  }
}
