import { z } from '../../libs/zod.js';
import { UUIDSchema, buildFilterSchema, createQuerySchema } from '../common.js';
import { $Enums } from '../../generated/prisma/client.js';

const ReportTargetType = $Enums.ReportTargetType;
const ProblemCategory = $Enums.ProblemCategory;
const ProblemType = $Enums.ProblemType;
const ReportStatus = $Enums.ReportStatus;
import { isValidCategoryTypePair } from '../../utils/reportValidation.js';
import { ReportFilterDescriptor } from '../../domain/report.entity.js';

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

export const ReportFilterSchema = buildFilterSchema(ReportFilterDescriptor);
export const ReportQuerySchema = createQuerySchema(ReportFilterSchema);
export type ReportQuery = z.infer<typeof ReportQuerySchema>;
