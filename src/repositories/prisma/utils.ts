export function isEmptyFilter(filter: object | undefined): boolean {
  if (!filter) return true;
  const values = Object.values(filter);
  return values.every((v) => v === undefined || v === null);
}

export function getEmptyPaginatedResult() {
  return {
    page: 1,
    limit: 10,
    count: 0,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };
}
