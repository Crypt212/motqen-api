export type FieldTypeDefinition = (
  | { type: 'uuid' }
  | { type: 'string'; minLength?: number; maxLength?: number }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'boolean' }
  | { type: 'date' }
  | { type: 'enum'; enumValues: [string, ...string[]] }
) & { sortable?: boolean; filterable?: boolean; searchable?: boolean };

/**
 * Paginated result wrapper
 */
export type PaginatedResultMeta = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * Pagination options for queries
 */
export type PaginationOptions =
  | {
      page?: number;
      limit?: number;
    }
  | undefined;

/**
 * Ordering options for queries
 */
export type SortOptions<T> = {
  sortBy: keyof T;
  sortOrder?: 'asc' | 'desc';
};
