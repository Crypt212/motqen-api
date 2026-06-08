import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { ReportObjectSchema, PaginationResponseSchema } from '../common.js';

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
