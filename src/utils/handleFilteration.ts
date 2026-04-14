import {
  PaginationOptions,
  PaginatedResultMeta,
  SortOptions,
  PaginatedResult,
} from 'src/types/query.js';

export function isEmptyFilter(filter: object | undefined): boolean {
  if (!filter) return true;
  const values = Object.values(filter);
  return values.every((v) => v === undefined || v === null);
}

export function getEmptyPaginatedResult<K extends object>(data: K): PaginatedResult<K> {
  return {
    ...data,
    meta: {
      page: 1,
      limit: 10,
      count: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export function paginateResult<K extends object>(
  data: K,
  pagination: PaginatedResultMeta
): PaginatedResult<K> {
  return {
    meta: pagination,
    ...data,
  };
}

export function getPaginationQuery(paginationOptions: PaginationOptions): {
  skip: number;
  take: number;
} {
  const { page, limit } = paginationOptions;
  const take = Math.max(limit || 10, 1);
  const skip = (page - 1) * limit;
  return { take, skip };
}

/**
 * Handle pagination logic
 */
export function getPaginationResult(params: {
  count: number;
  hasNext: boolean;
  paginationOptions: PaginationOptions;
}): PaginatedResultMeta {
  const { hasNext, count, paginationOptions } = params;
  const page = Math.max(paginationOptions?.page || 1, 1);

  return {
    page,
    limit: Math.max(paginationOptions?.limit || 10, 1),
    count,
    hasNext,
    hasPrev: page > 1,
  };
}

/**
 * Handle ordering logic
 */
export function handleSort<T>(sortOptions: SortOptions<T>): { [x: string]: 'asc' | 'desc' }[] {
  if (!sortOptions || !sortOptions.sortBy) return [];

  const order = sortOptions.sortOrder || 'asc';
  return [{ [sortOptions.sortBy]: order }];
}
