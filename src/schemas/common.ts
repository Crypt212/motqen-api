/**
 * @fileoverview Common Zod schemas and helpers
 * Replaces: src/validators/common.js
 * Place at: src/schemas/common.schema.ts
 */

import { z } from 'zod';

// ============================================
// Primitives — reusable building blocks
// ============================================

export const UUIDSchema = z.string().uuid('must be a valid UUID');

export const EgyptianPhoneSchema = z
  .string()
  .trim()
  .regex(/^(010|011|012|015)\d{8}$/, 'Please provide a valid Egyptian phone number')
  .transform(v => v.replace(/^\+20/, '0'));

export const OTPMethodSchema = z.enum(['SMS', 'WHATSAPP'], { message: 'Method must be either SMS or WhatsApp' });

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

export const LongitudeSchema = z.number({ message: 'long must be a number' })
  .min(-180, 'long must be between -180 and 180')
  .max(180, 'long must be between -180 and 180');

export const LatitudeSchema = z
  .number({ message: 'lat must be a number' })
  .min(-90, 'lat must be between -90 and 90')
  .max(90, 'lat must be between -90 and 90');

// ============================================
// Shared object schemas
// ============================================

export const UserDataSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'lastName is required'),
});

export const UserDataOptionalSchema = UserDataSchema.partial();

export const ClientProfileSchema = z.object({
  address: z.string().trim().min(1, 'address is required'),
  governmentId: UUIDSchema,
  cityId: UUIDSchema,
  addressNotes: z.string().trim().optional(),
});

export const ClientProfileOptionalSchema = ClientProfileSchema.partial();

// Specializations tree — mirrors specializationsTreeValidation in common.js
export const SpecializationTreeItemSchema = z.object({
  mainId: UUIDSchema,
  subIds: z.array(UUIDSchema).optional(),
});

export const SpecializationsTreeSchema = z
  .array(SpecializationTreeItemSchema)
  .min(1, 'specializationsTree must be a non-empty array');

// Work governments — mirrors workGovernmentsValidation in common.js
export const WorkGovernmentsSchema = z
  .array(UUIDSchema)
  .min(1, 'workGovernments must contain at least one government ID');

export const WorkerProfileSchema = z.object({
  specializationsTree: SpecializationsTreeSchema,
  workGovernments: WorkGovernmentsSchema,
  experienceYears: z
    .number({ message: 'experienceYears must be a number' })
    .int()
    .min(0),
  isInTeam: z.boolean({ message: 'isInTeam must be a boolean' }),
  acceptsUrgentJobs: z.boolean({
    message: 'acceptsUrgentJobs must be a boolean',
  }),
});

export const WorkerProfileOptionalSchema = WorkerProfileSchema.partial();

// ============================================
// Query schemas — replaces createQueryValidator
// ============================================

// Base pagination — all query params arrive as strings, use z.coerce
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'page must be a positive integer').optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const SortOrderSchema = z.enum(['asc', 'desc'], {
  message: 'sortOrder must be either "asc" or "desc"'
});

// ============================================
// createQuerySchema — replaces createQueryValidator()
//
// Takes the same config shape your old JS function took,
// returns a Zod schema instead of a ValidationChain[].
//
// Usage:
//   export const SessionsQuerySchema = createQuerySchema(SESSIONS_QUERY_CONFIG);
//   export type SessionsQuery = z.infer<typeof SessionsQuerySchema>;
// ============================================

type FieldTypeDefinition =
  | { type: 'uuid' }
  | { type: 'string'; minLength?: number; maxLength?: number }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'boolean' }
  | { type: 'date' }
  | { type: 'enum'; enumValues: [string, ...string[]] };

interface QueryValidationConfig {
  allowedFilterFields?: string[];
  filterFieldTypes?: Record<string, FieldTypeDefinition>;
  allowedOrderByFields?: string[];
  allowedSearchFields?: string[];
  maxPageSize?: number;
}

export const createQuerySchema = (config: QueryValidationConfig = {}) => {
  const {
    allowedFilterFields = [],
    filterFieldTypes = {},
    allowedOrderByFields = [],
    allowedSearchFields = [],
    maxPageSize = 100,
  } = config;

  const shape: Record<string, z.ZodTypeAny> = {
    page: z.coerce.number().int().min(1, 'page must be a positive integer').optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(maxPageSize, `limit must be between 1 and ${maxPageSize}`)
      .optional(),
  };

  if (allowedOrderByFields.length > 0) {
    shape.sortBy = z
      .enum(allowedOrderByFields as [string, ...string[]], {
        message: `sortBy must be one of: ${allowedOrderByFields.join(', ')}`,
      })
      .optional();
    shape.sortOrder = SortOrderSchema.optional();
  }

  if (allowedSearchFields.length > 0) {
    shape.search = z.string().min(2, 'search must be at least 2 characters').optional();
  }

  for (const field of allowedFilterFields) {
    const fieldType = filterFieldTypes[field];

    if (!fieldType) {
      shape[field] = z.string().optional();
      continue;
    }

    switch (fieldType.type) {
      case 'uuid':
        shape[field] = UUIDSchema.optional();
        break;
      case 'number': {
        let s = z.coerce.number();
        if (fieldType.min !== undefined) s = s.min(fieldType.min, `${field} must be at least ${fieldType.min}`);
        if (fieldType.max !== undefined) s = s.max(fieldType.max, `${field} must be at most ${fieldType.max}`);
        shape[field] = s.optional();
        break;
      }
      case 'boolean':
        shape[field] = z.coerce.boolean().optional();
        break;
      case 'date':
        shape[field] = z.coerce.date().optional();
        break;
      case 'enum':
        shape[field] = z.enum(fieldType.enumValues).optional();
        break;
      case 'string': {
        let s: z.ZodString = z.string();
        if (fieldType.minLength !== undefined) s = s.min(fieldType.minLength);
        if (fieldType.maxLength !== undefined) s = s.max(fieldType.maxLength);
        shape[field] = s.optional();
        break;
      }
    }
  }

  return z.object(shape);
};

// ============================================
// parseQueryParams — identical output to the old JS helper
// but now works with already-validated Zod data
// ============================================

export const parseQueryParams = (
  query: Record<string, unknown>,
  config: QueryValidationConfig = {},
) => {
  const {
    allowedFilterFields = [],
    allowedOrderByFields = [],
    allowedSearchFields = [],
  } = config;

  const paginate = query.page !== undefined || query.limit !== undefined;

  const pagination = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
  };

  const filter: Record<string, unknown> = {};

  for (const field of allowedFilterFields) {
    if (query[field] !== undefined && query[field] !== null && query[field] !== '') {
      filter[field] = query[field];
    }
  }

  if (query.search && allowedSearchFields.length > 0) {
    filter.OR = allowedSearchFields.map(field => ({
      [field]: { contains: query.search, mode: 'insensitive' },
    }));
  }

  const orderBy: { field: string; direction: string }[] = [];
  if (query.sortBy && allowedOrderByFields.includes(query.sortBy as string)) {
    orderBy.push({
      field: query.sortBy as string,
      direction: (query.sortOrder as string)?.toLowerCase() ?? 'asc',
    });
  }

  return { filter, pagination, orderBy, paginate };
};
