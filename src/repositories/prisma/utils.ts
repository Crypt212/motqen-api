import { PaginatedResult, PaginatedResultMeta, PaginationOptions } from 'src/types/query.js';

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
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export function paginateResult<K extends object>(
  data: K,
  pagination: PaginatedResultMeta
): PaginatedResult<K> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const total = pagination?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
    ...data,
  };
}
