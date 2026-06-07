import { describe, it, expect } from 'vitest';
import { handlePagination, handleSort } from '../../../src/utils/handleFilteration.js';

describe('handlePagination', () => {
  it('returns correct defaults when no options provided', () => {
    const result = handlePagination({ total: 50, paginationOptions: undefined });

    expect(result.paginationResult.page).toBe(1);
    expect(result.paginationResult.limit).toBe(10);
    expect(result.paginationResult.total).toBe(50);
    expect(result.paginationResult.totalPages).toBe(5);
    expect(result.paginationQuery.skip).toBe(0);
    expect(result.paginationQuery.take).toBe(10);
  });

  it('handles custom page and limit', () => {
    const result = handlePagination({
      total: 100,
      paginationOptions: { page: 3, limit: 20 },
    });

    expect(result.paginationResult.page).toBe(3);
    expect(result.paginationResult.limit).toBe(20);
    expect(result.paginationQuery.skip).toBe(40); // (3-1) * 20
    expect(result.paginationQuery.take).toBe(20);
  });

  it('clamps page to 1 when page is 0', () => {
    const result = handlePagination({
      total: 50,
      paginationOptions: { page: 0, limit: 10 },
    });

    expect(result.paginationResult.page).toBe(1);
  });

  it('clamps page to totalPages when page exceeds total', () => {
    const result = handlePagination({
      total: 30,
      paginationOptions: { page: 100, limit: 10 },
    });

    expect(result.paginationResult.page).toBe(3); // totalPages = ceil(30/10) = 3
  });

  it('clamps limit to 1 when limit is 0 or negative', () => {
    const result = handlePagination({
      total: 50,
      paginationOptions: { page: 1, limit: 0 },
    });

    expect(result.paginationResult.limit).toBe(1);
  });

  it('calculates hasNext correctly', () => {
    const page1 = handlePagination({
      total: 25,
      paginationOptions: { page: 1, limit: 10 },
    });
    expect(page1.paginationResult.hasNext).toBe(true);

    const lastPage = handlePagination({
      total: 25,
      paginationOptions: { page: 3, limit: 10 },
    });
    expect(lastPage.paginationResult.hasNext).toBe(false);
  });

  it('calculates hasPrev correctly', () => {
    const page1 = handlePagination({
      total: 25,
      paginationOptions: { page: 1, limit: 10 },
    });
    expect(page1.paginationResult.hasPrev).toBe(false);

    const page2 = handlePagination({
      total: 25,
      paginationOptions: { page: 2, limit: 10 },
    });
    expect(page2.paginationResult.hasPrev).toBe(true);
  });

  it('handles total of 0', () => {
    const result = handlePagination({
      total: 0,
      paginationOptions: { page: 1, limit: 10 },
    });

    expect(result.paginationResult.total).toBe(0);
    expect(result.paginationResult.totalPages).toBe(1);
    expect(result.paginationResult.hasNext).toBe(false);
  });

  it('handles single-page result', () => {
    const result = handlePagination({
      total: 5,
      paginationOptions: { page: 1, limit: 10 },
    });

    expect(result.paginationResult.totalPages).toBe(1);
    expect(result.paginationResult.hasNext).toBe(false);
    expect(result.paginationResult.hasPrev).toBe(false);
  });

  it('calculates correct count on last page', () => {
    const result = handlePagination({
      total: 25,
      paginationOptions: { page: 3, limit: 10 },
    });

    expect(result.paginationResult.count).toBe(5); // 25 % 10 = 5
  });

  it('calculates count as limit when last page is full', () => {
    const result = handlePagination({
      total: 30,
      paginationOptions: { page: 3, limit: 10 },
    });

    expect(result.paginationResult.count).toBe(10); // 30 % 10 = 0, so count = limit
  });
});

describe('handleSort', () => {
  it('returns empty array when no sort options', () => {
    expect(handleSort(undefined)).toEqual([]);
  });

  it('returns empty array for empty sort options', () => {
    expect(handleSort([])).toEqual([]);
  });

  it('handles single sort field with explicit order', () => {
    const result = handleSort([{ sortBy: 'name', sortOrder: 'desc' }]);

    expect(result).toEqual([{ name: 'desc' }]);
  });

  it('defaults to asc when sortOrder is not specified', () => {
    const result = handleSort([{ sortBy: 'createdAt' }]);

    expect(result).toEqual([{ createdAt: 'asc' }]);
  });

  it('handles multiple sort fields', () => {
    const result = handleSort([
      { sortBy: 'name', sortOrder: 'asc' },
      { sortBy: 'createdAt', sortOrder: 'desc' },
    ]);

    expect(result).toEqual([
      { name: 'asc' },
      { createdAt: 'desc' },
    ]);
  });

  it('filters out entries with null sortBy', () => {
    const result = handleSort([
      { sortBy: 'name', sortOrder: 'asc' },
      { sortBy: null as any, sortOrder: 'desc' },
    ]);

    expect(result).toEqual([{ name: 'asc' }]);
  });
});
