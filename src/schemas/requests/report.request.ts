import { z } from '../../libs/zod.js';
import { UUIDSchema, createQuerySchema } from '../common.js';
import { $Enums } from '../../generated/prisma/client.js';

const ReportTargetType = $Enums.ReportTargetType;
const ProblemCategory = $Enums.ProblemCategory;
const ProblemType = $Enums.ProblemType;
const ReportStatus = $Enums.ReportStatus;
import { isValidCategoryTypePair } from '../../utils/reportValidation.js';
import { ReportFilterSchema } from '../entities/reports.js';

export const CreateReportSchema = z
  .object({
    targetType: z.nativeEnum(ReportTargetType),
    targetId: z.string().optional(),
    contextOrderId: UUIDSchema.optional(),
    conversationId:  UUIDSchema.optional(),
    problemCategory: z.nativeEnum(ProblemCategory),
    problemType: z.nativeEnum(ProblemType),
    description: z.string().trim().min(10).max(2000),
  })
  .superRefine((data, ctx) => {
    if (!isValidCategoryTypePair(data.problemCategory, data.problemType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['problemType'],
        message: `Problem type ${data.problemType} is not valid for category ${data.problemCategory}`,
      });
    }
  });

export type CreateReportDTO = z.infer<typeof CreateReportSchema>;

export const UpdateReportSchema = z.object({
  description: z.string().trim().min(10).max(2000).optional(),
});

export type UpdateReportDTO = z.infer<typeof UpdateReportSchema>;

export const UpdateReportStatusSchema = z.object({
  status: z.enum([ReportStatus.UNDER_REVIEW, ReportStatus.RESOLVED, ReportStatus.REJECTED]),
});

export type UpdateReportStatusDTO = z.infer<typeof UpdateReportStatusSchema>;

export const ReportIdParamsSchema = z.object({
  reportId: UUIDSchema,
});

export const ReportQuerySchema = createQuerySchema(ReportFilterSchema);
export type ReportQuery = z.infer<typeof ReportQuerySchema>;

import { EmptySchema } from '../common.js';

export const CreateReportRequestSchema = CreateReportSchema;
export type CreateReportRequestDTO = z.infer<typeof CreateReportRequestSchema>;
export const CreateReportQuerySchema = EmptySchema;
export type CreateReportQueryDTO = z.infer<typeof CreateReportQuerySchema>;
export const CreateReportParamsSchema = EmptySchema;
export type CreateReportParamsDTO = z.infer<typeof CreateReportParamsSchema>;

export const GetReportsRequestSchema = EmptySchema;
export type GetReportsRequestDTO = z.infer<typeof GetReportsRequestSchema>;
export const GetReportsQuerySchema = ReportQuerySchema;
export type GetReportsQueryDTO = z.infer<typeof GetReportsQuerySchema>;
export const GetReportsParamsSchema = EmptySchema;
export type GetReportsParamsDTO = z.infer<typeof GetReportsParamsSchema>;

export const GetReportByIdRequestSchema = EmptySchema;
export type GetReportByIdRequestDTO = z.infer<typeof GetReportByIdRequestSchema>;
export const GetReportByIdQuerySchema = EmptySchema;
export type GetReportByIdQueryDTO = z.infer<typeof GetReportByIdQuerySchema>;
export const GetReportByIdParamsSchema = ReportIdParamsSchema;
export type GetReportByIdParamsDTO = z.infer<typeof GetReportByIdParamsSchema>;

export const UpdateReportRequestSchema = UpdateReportSchema;
export type UpdateReportRequestDTO = z.infer<typeof UpdateReportRequestSchema>;
export const UpdateReportQuerySchema = EmptySchema;
export type UpdateReportQueryDTO = z.infer<typeof UpdateReportQuerySchema>;
export const UpdateReportParamsSchema = ReportIdParamsSchema;
export type UpdateReportParamsDTO = z.infer<typeof UpdateReportParamsSchema>;

export const CancelReportRequestSchema = EmptySchema;
export type CancelReportRequestDTO = z.infer<typeof CancelReportRequestSchema>;
export const CancelReportQuerySchema = EmptySchema;
export type CancelReportQueryDTO = z.infer<typeof CancelReportQuerySchema>;
export const CancelReportParamsSchema = ReportIdParamsSchema;
export type CancelReportParamsDTO = z.infer<typeof CancelReportParamsSchema>;

export const UpdateReportStatusRequestSchema = UpdateReportStatusSchema;
export type UpdateReportStatusRequestDTO = z.infer<typeof UpdateReportStatusRequestSchema>;
export const UpdateReportStatusQuerySchema = EmptySchema;
export type UpdateReportStatusQueryDTO = z.infer<typeof UpdateReportStatusQuerySchema>;
export const UpdateReportStatusParamsSchema = ReportIdParamsSchema;
export type UpdateReportStatusParamsDTO = z.infer<typeof UpdateReportStatusParamsSchema>;
