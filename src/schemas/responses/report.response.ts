import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { PaginationResponseSchema } from '../common.js';
import { ReportObjectSchema } from '../entities/reports.js';

export const ReportResponseSchema = SuccessResponseSchema(
  z.object({
    report: ReportObjectSchema,
  }),
);
export type ReportResponseDTO = z.infer<typeof ReportResponseSchema>;

export const PaginatedReportsResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ reports: z.array(ReportObjectSchema) })
);
export type PaginatedReportsResponseDTO = z.infer<typeof PaginatedReportsResponseSchema>;

import { MessageOnlyResponseSchema } from '../responses.js';

export const CreateReportResponseSchema = ReportResponseSchema;
export type CreateReportResponseDTO = z.infer<typeof CreateReportResponseSchema>;

export const GetReportsResponseSchema = PaginatedReportsResponseSchema;
export type GetReportsResponseDTO = z.infer<typeof GetReportsResponseSchema>;

export const GetReportByIdResponseSchema = ReportResponseSchema;
export type GetReportByIdResponseDTO = z.infer<typeof GetReportByIdResponseSchema>;

export const UpdateReportResponseSchema = ReportResponseSchema;
export type UpdateReportResponseDTO = z.infer<typeof UpdateReportResponseSchema>;

export const CancelReportResponseSchema = MessageOnlyResponseSchema;
export type CancelReportResponseDTO = z.infer<typeof CancelReportResponseSchema>;

export const UpdateReportStatusResponseSchema = ReportResponseSchema;
export type UpdateReportStatusResponseDTO = z.infer<typeof UpdateReportStatusResponseSchema>;
