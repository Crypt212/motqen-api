/**
 * @fileoverview Common Zod schemas and helpers
 */

import { FieldTypeDefinition } from '../types/query.js';
import { z } from '../libs/zod.js';

// ============================================
// Primitives
// ============================================

export const UUIDSchema = z.string().uuid('must be a valid UUID');

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

export const SpecializationTreeItemSchema = z.object({
  mainId: UUIDSchema,
  subIds: z.array(UUIDSchema).optional(),
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
  console.log('inside parseQueryParams');
  console.log('query: ', query);

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
