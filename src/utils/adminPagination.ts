export type PaginatedMeta = {
  total: number;
  page: number;
  pageSize: number;
};

export function parseAdminPagination(query: {
  page?: string | number;
  pageSize?: string | number;
  limit?: string | number;
}): { page: number; pageSize: number; skip: number } {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? query.limit) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): { data: T[]; meta: PaginatedMeta } {
  return { data, meta: { total, page, pageSize } };
}

export function toNumber(value: bigint | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'bigint' ? Number(value) : value;
}
