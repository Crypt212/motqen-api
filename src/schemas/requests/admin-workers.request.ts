import { z } from '../../libs/zod.js';
import { UUIDSchema, EgyptianPhoneSchema } from '../common.js';
import { $Enums } from '../../generated/prisma/client.js';

const AccountStatus = $Enums.AccountStatus;
const VerificationStatus = $Enums.VerificationStatus;
const VerificationRejectionReason = $Enums.VerificationRejectionReason;

export const AdminWorkerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  accountStatus: z.nativeEnum(AccountStatus).optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
  government: UUIDSchema.optional(),
  specialization: UUIDSchema.optional(),
  search: z.string().optional(),
});

export const ManualWorkerCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'lastName is required'),
  phoneNumber: EgyptianPhoneSchema,
  governmentId: UUIDSchema,
  cityId: UUIDSchema,
  specializationIds: z.array(UUIDSchema).min(1, 'At least one specialization is required'),
});

export const RejectWorkerSchema = z.object({
  rejectionReasons: z.array(z.nativeEnum(VerificationRejectionReason)).min(1, 'At least one rejection reason is required'),
  rejectionNote: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.rejectionReasons.includes('OTHER') && !data.rejectionNote) {
      return false;
    }
    return true;
  },
  {
    message: 'rejectionNote is required when OTHER is selected',
    path: ['rejectionNote'],
  }
);

export const SuspendWorkerSchema = z.object({
  reason: z.string().trim().min(1, 'reason is required'),
});
