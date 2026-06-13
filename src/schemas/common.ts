/**
 * @fileoverview Common Zod schemas and helpers
 */

import { z } from '../libs/zod.js';
import AppError from 'src/errors/AppError.js';

export const UUIDSchema = z.string().uuid('must be a valid UUID');
export const URLSchema = z.string().url().max(1000);


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


export const OccupiedTimeSlotViewSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});


export const PaginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  count: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),

});

export const Time24HourSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format');

export const DayOfWeekSchema = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);

export const LongitudeSchema = z
  .number({ message: 'long must be a number' })
  .min(-180, 'long must be between -180 and 180')
  .max(180, 'long must be between -180 and 180');

export const LatitudeSchema = z
  .number({ message: 'lat must be a number' })
  .min(-90, 'lat must be between -90 and 90')
  .max(90, 'lat must be between -90 and 90');


// ============================================
// Filter Metadata
// ============================================

const FILTER_META = Symbol('filterMeta');

interface FilterMeta<TSort extends string = string> {
  sortableFields: TSort[];
}

export type ZodFilterSchemaMetadata<
  T extends z.ZodRawShape,
  TSort extends string = never,
> = z.ZodObject<T> & {
  [FILTER_META]: FilterMeta<TSort>;
};

// ============================================
// createFilterMetadata
// ============================================

export function createFilterMetadata<
  T extends z.ZodRawShape,
  TSort extends keyof T & string = never,
>(
  shape: T,
  options: { sortableFields?: TSort[]; } = {}
): ZodFilterSchemaMetadata<{ [K in keyof T]: z.ZodOptional<T[K]> }, TSort> {
  const optionalShape = Object.fromEntries(
    Object.entries(shape).map(([k, v]) => [k, z.optional(v)])
  ) as { [K in keyof T]: z.ZodOptional<T[K]> };

  const schema = z.object(optionalShape) as ZodFilterSchemaMetadata<
    { [K in keyof T]: z.ZodOptional<T[K]> },
    TSort
  >;

  schema[FILTER_META] = {
    sortableFields: (options.sortableFields ?? []) as TSort[],
  };

  return schema;
};

// ============================================
// createQuerySchema
// ============================================

export const SortOrderSchema = z.enum(['asc', 'desc'], {
  message: 'sortOrder must be either "asc" or "desc"',
}).default('asc');

type BaseExtras = {
  page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
  limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
};

type WithSortExtras = {
  sort: z.ZodOptional<z.ZodString>,
};

export function createQuerySchema<
  T extends z.ZodRawShape,
  TSort extends string = never,
>(
  filterSchema: ZodFilterSchemaMetadata<T, TSort>,
  options: { maxPageSize?: number } = {}
): z.ZodObject<
  T &
  BaseExtras &
  ([TSort] extends [never] ? object : WithSortExtras)
> {
  const { maxPageSize = 100 } = options;
  const { sortableFields } = filterSchema[FILTER_META];

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

    const validFields = sortableFields.join('|');
    const sortPattern = new RegExp(`^(${validFields}) (asc|desc)$`);

    extras.sort = z.string()
      .transform((val) => val.split(',').map(entry => entry.trim().replace('+', ' ')))
      .pipe(
        z.array(
          z.string().regex(
            sortPattern,
            `each sort must be "field:asc" or "field:desc" or "field asc" or "field desc", or "field" to sort by default order. valid fields: ${sortableFields.join(', ')}`,
          )
        )
      ).optional();
  }

  return filterSchema.extend(extras as any) as unknown as any;
}

// ============================================
// Reads already-validated Zod query output and shapes it
// for repository consumption. Works off filter schema metadata
// instead of a separate config object.
// ============================================

export function parseQuery<T extends object, TSort extends string = never>(
  query: T & {
    page: number;
    limit: number;
    sort?: string;
  }
) {
  const q = query;

  const pagination = {
    page: q.page ? Number(q.page) : 1,
    limit: q.limit ? Number(q.limit) : 20,
  };

  const { page, limit, sort, ...filter } = query;

  const rawSort = typeof q.sort === 'string'
    ? q.sort.split(',').map((e) => e.trim().replace('+', ' '))
    : [];

  const finalSortBy: TSort[] = [];
  const finalSortOrder: ('asc' | 'desc')[] = [];

  const sorted: Set<TSort> = new Set();

  if (rawSort)
    for (const entry of rawSort) {
      const [field, order] = entry.split(' ');
      if (sorted.has(field as TSort))
        throw new AppError(`sortBy must be unique: ${sort}`, 400);

      finalSortBy.push(field as TSort);
      finalSortOrder.push(order as 'asc' | 'desc');
      sorted.add(field as TSort);
    }

  return { filter, pagination, sortBy: finalSortBy, sortOrder: finalSortOrder };
}


// ====================================================
// Useless Extras
// ====================================================

export const StringifiedJsonSchema = <T extends z.ZodSchema>(schema: T) => {
  return z.string().transform((str, ctx): z.infer<T> => {
    try {
      const parsed = JSON.parse(str);
      return schema.parse(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON format',
          path: ['json'],
        });
      } else if (error instanceof z.ZodError) {
        // error.issues.forEach((err) => ctx.addIssue(err));
      }
      return z.NEVER;
    }
  });
};

export function parseJSON() {
  return z
    .string()
    .trim()
    .transform((val: string) => JSON.parse(val));
}
export const EmptySchema = z.strictObject({});
export type EmptyObjectDTO = z.infer<typeof EmptySchema>;
