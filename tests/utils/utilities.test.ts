/**
 * Utility Tests — handlePagination, handleSort, getRandomElements
 *
 * handlePagination is used by every repository's findMany. Bugs here
 * cascade across the entire app. These tests verify:
 *   - Input is never mutated
 *   - Edge cases: 0 total, page exceeds total, undefined options
 *   - count calculation on the last page
 */
import { describe, it, expect } from 'vitest';
import { handlePagination, handleSort } from '../../src/utils/handleFilteration.js';
import getRandomElements from '../../src/utils/randomElements.js';

describe('handlePagination', () => {
  it('should calculate skip and take for first page', () => {
    const result = handlePagination({
      total: 50,
      paginationOptions: { page: 1, limit: 10 },
    });

    expect(result.paginationQuery).toEqual({ skip: 0, take: 10 });
    expect(result.paginationResult.page).toBe(1);
    expect(result.paginationResult.total).toBe(50);
    expect(result.paginationResult.totalPages).toBe(5);
    expect(result.paginationResult.hasNext).toBe(true);
    expect(result.paginationResult.hasPrev).toBe(false);
  });

  it('should calculate for last page', () => {
    const result = handlePagination({
      total: 50,
      paginationOptions: { page: 5, limit: 10 },
    });

    expect(result.paginationQuery).toEqual({ skip: 40, take: 10 });
    expect(result.paginationResult.hasNext).toBe(false);
    expect(result.paginationResult.hasPrev).toBe(true);
  });

  it('should clamp page to totalPages when exceeding', () => {
    const result = handlePagination({
      total: 30,
      paginationOptions: { page: 999, limit: 10 },
    });

    expect(result.paginationResult.page).toBe(3); // clamped
  });

  it('should clamp page to 1 when given 0 or negative', () => {
    const result = handlePagination({
      total: 50,
      paginationOptions: { page: 0, limit: 10 },
    });

    expect(result.paginationResult.page).toBe(1);
  });

  it('should default limit to 10 and page to 1 when undefined', () => {
    const result = handlePagination({
      total: 50,
      paginationOptions: { page: undefined, limit: undefined },
    });

    expect(result.paginationResult.limit).toBe(10);
    expect(result.paginationResult.page).toBe(1);
  });

  it('should handle undefined paginationOptions gracefully', () => {
    const result = handlePagination({
      total: 25,
      paginationOptions: undefined,
    });

    expect(result.paginationResult.page).toBe(1);
    expect(result.paginationResult.limit).toBe(10);
    expect(result.paginationResult.totalPages).toBe(3);
  });

  it('should handle 0 total without errors', () => {
    const result = handlePagination({
      total: 0,
      paginationOptions: { page: 1, limit: 10 },
    });

    expect(result.paginationResult.totalPages).toBe(1);
    expect(result.paginationResult.count).toBe(10);
    expect(result.paginationResult.hasNext).toBe(false);
  });

  it('should NOT mutate the input paginationOptions object', () => {
    const options = { page: 2, limit: 5 };
    const optionsCopy = { ...options };

    handlePagination({ total: 50, paginationOptions: options });

    expect(options).toEqual(optionsCopy);
  });

  it('should calculate correct count on last page with remainder', () => {
    const result = handlePagination({
      total: 23,
      paginationOptions: { page: 3, limit: 10 },
    });

    // 23 items, page 3, limit 10 → 3 items on last page
    expect(result.paginationResult.count).toBe(3);
  });

  it('should set count=limit when total is exact multiple of limit', () => {
    const result = handlePagination({
      total: 30,
      paginationOptions: { page: 3, limit: 10 },
    });

    // 30 % 10 = 0, but || limit kicks in → count = 10
    expect(result.paginationResult.count).toBe(10);
  });
});

describe('handleSort', () => {
  it('should return empty array for undefined sort options', () => {
    expect(handleSort(undefined as any)).toEqual([]);
  });

  it('should return empty array when sortBy is missing', () => {
    expect(handleSort({} as any)).toEqual([]);
  });

  it('should default to asc order', () => {
    const result = handleSort({ sortBy: 'createdAt' } as any);
    expect(result).toEqual([{ createdAt: 'asc' }]);
  });

  it('should use provided sort order', () => {
    const result = handleSort({ sortBy: 'name', sortOrder: 'desc' } as any);
    expect(result).toEqual([{ name: 'desc' }]);
  });
});

describe('getRandomElements', () => {
  it('should return the requested number of elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = getRandomElements(arr, 3);
    expect(result).toHaveLength(3);
  });

  it('should NOT mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    getRandomElements(arr, 2);
    expect(arr).toEqual(original);
  });

  it('should return all elements when count >= array length', () => {
    const arr = [1, 2, 3];
    const result = getRandomElements(arr, 5);
    expect(result).toHaveLength(3);
  });

  it('should return empty array for empty input', () => {
    expect(getRandomElements([], 5)).toEqual([]);
  });
});
