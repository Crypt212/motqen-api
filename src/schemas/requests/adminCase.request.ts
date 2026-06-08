import { z } from '../../libs/zod.js';

export const CaseTypeSchema = z.enum(['ACCOUNT_ISSUE', 'FINANCIAL_ISSUE', 'DISPUTE_CASE']);

export const NormalizedCaseStatusSchema = z.enum([
  'PENDING',
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED',
  'REJECTED',
  'CANCELLED',
]);

export const AdminCaseListQuerySchema = z.object({
  status: NormalizedCaseStatusSchema.optional(),
  caseType: CaseTypeSchema.optional(),
  assigned: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  assignedAdminId: z.string().uuid().optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const AdminCaseStatsQuerySchema = z.object({
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
});

export const AdminCaseDetailParamsSchema = z.object({
  caseType: CaseTypeSchema,
  caseId: z.string().uuid(),
});

export type AdminCaseListQuery = z.infer<typeof AdminCaseListQuerySchema>;
export type AdminCaseStatsQuery = z.infer<typeof AdminCaseStatsQuerySchema>;
