/**
 * Paginated result wrapper
 */
export type PaginatedResult<T> = {
  data: T[],
  page: number,
  limit: number,
  count: number,
  total: number,
  totalPages: number,
  hasNext: boolean,
  hasPrev: boolean,
}

/**
 * Pagination options for queries
 */
export type PaginationOptions = {
  page?: number,
  limit?: number,
} | undefined;

/**
 * Ordering options for queries
 */
export type SortOptions<T> = {
  sortBy: keyof T,
  sortOrder?: 'asc' | 'desc',
}

/**
 * Query options combining filter, pagination, and ordering
 */
export type QueryOptions<T> = {
  where?: Record<string, any>,
  select?: Record<string, any>,
  include?: string[],
  pagination?: PaginationOptions,
  orderBy?: SortOptions<T>[],
}
