export function isEmptyFilter(filter: Record<string, unknown>): boolean {
  return Object.values(filter).every((v) => v === undefined || v === null);
}

export function getEmptyPaginatedResult() {
  return {
    data: [],
    page: 1,
    limit: 10,
    count: 0,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };
}
