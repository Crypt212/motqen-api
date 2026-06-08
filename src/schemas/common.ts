/**
 * @fileoverview Common Zod schemas and helpers
 */

import { FieldTypeDefinition } from '../types/query.js';
import { z } from '../libs/zod.js';

export const UUIDSchema = z.string().uuid('must be a valid UUID');

export const SubSpecializationObjectSchema = z.object({
  id: UUIDSchema,
  mainSpecializationId: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SpecializationObjectSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  category: z.string(),
  ordersCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SpecializationWithSubSpecializationsObjectSchema = z.object({
  id: UUIDSchema,
  subSpecializations: z.array(SubSpecializationObjectSchema),
  name: z.string(),
  nameAr: z.string(),
  category: z.string(),
  ordersCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ReportObjectSchema = z.object({
  id: z.string().uuid(),
  reporterId: z.string().uuid(),
  targetType: z.enum(['ORDER', 'CHAT_MESSAGE', 'WORKER_PROFILE', 'CLIENT_PROFILE']),
  targetId: z.string(),
  contextOrderId: z.string().uuid().nullable().optional(),
  problemCategory: z.enum(['ORDER_ISSUE', 'WORKER_CONDUCT', 'CLIENT_CONDUCT', 'CHAT_MESSAGE', 'OTHER']),
  problemType: z.enum([
    'UNFINISHED_WORK',
    'PAYMENT_DISPUTE',
    'NO_SHOW',
    'PROPERTY_DAMAGE',
    'UNPROFESSIONAL_BEHAVIOR',
    'FRAUD',
    'PAYMENT_FRAUD',
    'UNREASONABLE_DEMANDS',
    'SPAM',
    'INAPPROPRIATE_CONTENT',
    'HARASSMENT',
    'OTHER',
  ]),
  description: z.string(),
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED']),
  resolvedBy: z.string().uuid().nullable().optional(),
  retainUntil: z.date().nullable().optional(),
  images: z.array(z.string().url()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// Primitives
// ============================================

export const EgyptianPhoneSchema = z
  .string()
  .trim()
  .regex(/^(010|011|012|015)\d{8}$/, 'Please provide a valid Egyptian phone number')
  .transform((v) => v.replace(/^\+20/, '0'));

export const OTPMethodSchema = z.enum(['SMS', 'WHATSAPP'], {
  message: 'Method must be either SMS or WHATSAPP',
});

export const OTPCodeSchema = z
  .string()
  .trim()
  .min(4, 'OTP must be between 4 and 6 digits')
  .max(6, 'OTP must be between 4 and 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

export const NameSchema = (fieldName: string, min = 2, max = 100) =>
  z
    .string()
    .trim()
    .min(min, `${fieldName} must be between ${min} and ${max} characters`)
    .max(max, `${fieldName} must be between ${min} and ${max} characters`);

export const LongitudeSchema = z
  .number({ message: 'long must be a number' })
  .min(-180, 'long must be between -180 and 180')
  .max(180, 'long must be between -180 and 180');

export const LatitudeSchema = z
  .number({ message: 'lat must be a number' })
  .min(-90, 'lat must be between -90 and 90')
  .max(90, 'lat must be between -90 and 90');

export const OccupiedTimeSlotObjectSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

// ============================================
// Shared object schemas
// ============================================

export const PortfolioObjectSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  description: z.string(),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export const ProjectImageSchema = z.object({

  id: UUIDSchema,
  portfolioId: UUIDSchema,
  imageUrl: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LocationSchema = z.object({
  address: z.string().trim().min(1, 'address is required'),
  governmentId: UUIDSchema,
  cityId: UUIDSchema,
  isMain: z.boolean(),
  addressNotes: z.string().trim().optional(),
  long: LongitudeSchema,
  lat: LatitudeSchema,
});

export const LocationOptionalSchema = LocationSchema.partial();

export const UserDataSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'lastName is required'),
  location: LocationSchema,
});

export const UserDataOptionalSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required').optional(),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'lastName is required').optional(),
  location: LocationOptionalSchema.optional(),
});

export const SpecializationTreeItemSchema = z.object({
  mainId: UUIDSchema,
  subIds: z.array(UUIDSchema),
});

export const SpecializationsTreeSchema = z
  .array(SpecializationTreeItemSchema)
  .min(1, 'specializationsTree must be a non-empty array');

export const WorkGovernmentsSchema = z
  .array(UUIDSchema)
  .min(1, 'workGovernments must contain at least one government ID');

export const WorkerProfileSchema = z.object({
  specializationsTree: SpecializationsTreeSchema,
  workGovernmentIds: WorkGovernmentsSchema,
  experienceYears: z.number({ message: 'experienceYears must be a number' }).int().min(0),
  isInTeam: z.boolean({ message: 'isInTeam must be a boolean' }),
  acceptsUrgentJobs: z.boolean({ message: 'acceptsUrgentJobs must be a boolean' }),
});

export const WorkerProfileOptionalSchema = WorkerProfileSchema.partial();

export const ClientProfileSchema = z.object({});

export const ClientProfileOptionalSchema = ClientProfileSchema.partial();

export const ClientSummarySchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  rating: z.number().optional().nullable(),
});

export const OrderObjectSchema = z.object({
  id: UUIDSchema,
  title: z.string(),
  description: z.string(),
  clientUserId: UUIDSchema,
  workerUserId: UUIDSchema.nullable(),
  locationId: UUIDSchema,
  subSpecialization: SubSpecializationObjectSchema,
  orderStatus: z.enum(['PENDING', 'WORKER_SELECTED', 'TIME_SPECIFIED', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED']),
  workStatus: z.enum(['PENDING', 'WAITING_FOR_WORK', 'STARTED', 'DONE']),
  initialPrice: z.number().nullable(),
  finalPrice: z.number().nullable(),
  startDate: z.coerce.date().nullable(),
  estimatedDurationHours: z.number().nullable(),
  isUrgent: z.boolean(),
  rate: z.number().nullable(),
  comment: z.string().nullable(),
  workStartedAt: z.coerce.date().nullable(),
  workFinishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  images: z.array(z.string()),
  orderMode: z.enum(['DIRECT', 'GLOBAL']),
});

export const NegotiationObjectSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  proposalId: UUIDSchema,
  price: z.number(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  note: z.string().nullable(),
  startDate: z.date(),
  estimatedDurationHours: z.number(),
  hasOverlapWarning: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerSummarySchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable(),
  experienceYears: z.number(),
  rate: z.number(),
  ratingCount: z.number(),
  completedJobsCount: z.number(),
});

export const LatestNegotiationSnapshotSchema = z.object({
  id: UUIDSchema,
  price: z.number(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  startDate: z.date(),
  estimatedDurationHours: z.number(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  createdAt: z.date(),
}).nullable();

export const ProposalObjectSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  workerProfileId: UUIDSchema,
  status: z.enum(['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'DISMISSED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProposalWithWorkerSummarySchema = ProposalObjectSchema.extend({
  workerProfile: WorkerSummarySchema,
  latestNegotiation: LatestNegotiationSnapshotSchema.nullable(),
});

export const PaginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  count: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),

});

// ============================================
// Filter descriptor
// ============================================

type InferFieldType<F extends FieldTypeDefinition> = F extends { type: 'uuid' }
  ? string
  : F extends { type: 'string' }
  ? string
  : F extends { type: 'number' }
  ? number
  : F extends { type: 'boolean' }
  ? boolean
  : F extends { type: 'date' }
  ? Date
  : F extends { type: 'enum'; enumValues: infer E extends [string, ...string[]] }
  ? E[number]
  : never;

export type FilterFromDescriptor<D extends Record<string, FieldTypeDefinition>> = {
  [K in keyof D]?: InferFieldType<D[K]>;
};

// ============================================
// buildFilterSchema
// ============================================

const FILTER_META = Symbol('filterMeta');

interface FilterMeta {
  sortableFields: string[];
  searchableFields: string[];
}

export type ZodFilterSchema<T extends z.ZodRawShape> = z.ZodObject<T> & {
  [FILTER_META]: FilterMeta;
};

export const buildFilterSchema = <D extends Record<string, FieldTypeDefinition>>(
  descriptor: D
): ZodFilterSchema<{ [K in keyof D]: z.ZodOptional<z.ZodTypeAny> }> => {
  const shape: Record<string, z.ZodTypeAny> = {};
  const sortableFields: string[] = [];
  const searchableFields: string[] = [];

  for (const [field, def] of Object.entries(descriptor)) {
    if (def.sortable) sortableFields.push(field);
    if (def.searchable) searchableFields.push(field);

    switch (def.type) {
      case 'uuid':
        shape[field] = z.string().uuid(`${field} must be a valid UUID`).optional();
        break;
      case 'string': {
        let s: z.ZodString = z.string();
        if (def.minLength !== undefined)
          s = s.min(def.minLength, `${field} must be at least ${def.minLength} characters`);
        if (def.maxLength !== undefined)
          s = s.max(def.maxLength, `${field} must be at most ${def.maxLength} characters`);
        shape[field] = s.optional();
        break;
      }
      case 'number': {
        let s = z.coerce.number({ message: `${field} must be a number` });
        if (def.min !== undefined) s = s.min(def.min, `${field} must be at least ${def.min}`);
        if (def.max !== undefined) s = s.max(def.max, `${field} must be at most ${def.max}`);
        shape[field] = s.optional();
        break;
      }
      case 'boolean':
        shape[field] = z.coerce.boolean({ message: `${field} must be a boolean` }).optional();
        break;
      case 'date':
        shape[field] = z.coerce.date({ message: `${field} must be a valid date` }).optional();
        break;
      case 'enum':
        shape[field] = z
          .enum(def.enumValues, {
            message: `${field} must be one of: ${def.enumValues.join(', ')}`,
          })
          .optional();
        break;
    }
  }

  const schema = z.object(shape) as ZodFilterSchema<{
    [K in keyof D]: z.ZodOptional<z.ZodTypeAny>;
  }>;

  schema[FILTER_META] = { sortableFields, searchableFields };

  return schema;
};

// ============================================
// createQuerySchema
// ============================================

export const SortOrderSchema = z.enum(['asc', 'desc'], {
  message: 'sortOrder must be either "asc" or "desc"',
});

export const createQuerySchema = <T extends z.ZodRawShape>(
  filterSchema: ZodFilterSchema<T>,
  options: { maxPageSize?: number } = {}
) => {
  const { maxPageSize = 100 } = options;
  const { sortableFields, searchableFields } = filterSchema[FILTER_META];

  const extras: Record<string, z.ZodTypeAny> = {
    page: z.coerce
      .number({ message: 'page must be a number' })
      .int()
      .min(1, 'page must be a positive integer')
      .optional(),
    limit: z.coerce
      .number({ message: 'limit must be a number' })
      .int()
      .min(1)
      .max(maxPageSize, `limit must be between 1 and ${maxPageSize}`)
      .optional(),
  };

  if (sortableFields.length > 0) {
    extras.sortBy = z
      .enum(sortableFields as [string, ...string[]], {
        message: `sortBy must be one of: ${sortableFields.join(', ')}`,
      })
      .optional();
    extras.sortOrder = SortOrderSchema.optional();
  }

  if (searchableFields.length > 0) {
    extras.search = z.string().min(2, 'search must be at least 2 characters').optional();
  }

  return filterSchema.extend(extras);
};

// ============================================
// parseQueryParams
// Reads already-validated Zod query output and shapes it
// for repository consumption. Works off filter schema metadata
// instead of a separate config object.
// ============================================

export const parseQueryParams = <T extends z.ZodRawShape>(
  query: Record<string, unknown>,
  filterSchema: ZodFilterSchema<T>
) => {
  const { sortableFields, searchableFields } = filterSchema[FILTER_META];
  const filterFields = Object.keys(filterSchema.shape);

  const pagination = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
  };

  const filter: Record<string, unknown> = {};

  for (const field of filterFields) {
    if (query[field] !== undefined && query[field] !== null && query[field] !== '') {
      filter[field] = query[field];
    }
  }

  if (query.search && searchableFields.length > 0) {
    filter.OR = searchableFields.map((field) => ({
      [field]: { contains: query.search, mode: 'insensitive' },
    }));
  }

  const sort: { sortBy: keyof T; sortOrder: 'asc' | 'desc' }[] = [];
  if (query.sortBy && sortableFields.includes(query.sortBy as string)) {
    sort.push({
      sortBy: query.sortBy as keyof T,
      sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
    });
  }

  return { filter, pagination, sort };
};
