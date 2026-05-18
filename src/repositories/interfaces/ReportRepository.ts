import {
  Report,
  ReportWithImages,
  ReportCreateInput,
  ReportUpdateInput,
  ReportStatusUpdateInput,
  ReportFilter,
  ReportTargetType,
  ProblemCategory,
} from '../../domain/report.entity.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';

export default interface IReportRepository {
  isPendingOrUnderReview(params: {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    problemCategory: ProblemCategory;
  }): Promise<boolean>;

  countRecentReports(params: {
    reporterId: string;
    since: Date;
  }): Promise<number>;

  findById(params: { id: string }): Promise<ReportWithImages | null>;

  findMany(params: {
    filter: ReportFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<ReportWithImages>;
  }): Promise<PaginatedResultMeta & { reports: ReportWithImages[] }>;

  create(params: { report: ReportCreateInput }): Promise<ReportWithImages>;

  updateById(params: { id: string; report: ReportUpdateInput }): Promise<ReportWithImages>;

  updateStatusById(params: { id: string; status: ReportStatusUpdateInput }): Promise<ReportWithImages>;
}
