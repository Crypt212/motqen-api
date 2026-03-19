/**
 * @fileoverview Tests for Repository base class
 * @module tests/repositories/repository
 */

import {handleOrder, handlePagination} from '../../src/utils/handleFilteration.js'
describe('Repository', () => {
  describe('handleOrder', () => {
    test('should return empty array for empty array', () => {
      const result = handleOrder(undefined);
      expect(result).toEqual([]);
    });

    test('should convert single orderBy to array', () => {
      const result = handleOrder(
        { sortBy: 'name', sortOrder: 'asc' },
      );
      
      expect(result).toEqual([{ name: 'asc' }]);
    });

  //   test('should handle multiple orderBy fields', () => {
  //     const result =handleOrder([
  //       { field: 'name', direction: 'asc' },
  //       { field: 'createdAt', direction: 'desc' },
  //     ]);
  //     expect(result).toEqual([{ name: 'asc' }, { createdAt: 'desc' }]);
  //   });
   });

  describe('handlePagination', () => {
    test('should return correct pagination for first page', () => {
      const result = handlePagination({
        total: 100,
        pagination: { page: 1, limit: 10 },
      });

      expect(result.paginationQuery).toEqual({
        skip: 0,
        take: 10,
      });
      expect(result.paginationResult).toEqual({
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false,
        count:10
      });
    });

    test('should return correct pagination for middle page', () => {
      const result = handlePagination({
        total: 100,
        pagination: { page: 5, limit: 10 },
      });

      expect(result.paginationQuery).toEqual({
        skip: 40,
        take: 10,
      });
      expect(result.paginationResult).toEqual({
        page: 5,
        count:10,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: true,
      });
    });

    test('should return correct pagination for last page', () => {
      const result = handlePagination({
        total: 100,
        pagination: { page: 10, limit: 10 },
      });

      expect(result.paginationResult.hasNext).toBe(false);
      expect(result.paginationResult.hasPrev).toBe(true);
    });

    test('should handle zero total', () => {
      const result = handlePagination({
        total: 0,
        pagination: { page: 1, limit: 10 },
      });

      expect(result.paginationResult.totalPages).toBe(0);
      expect(result.paginationResult.hasNext).toBe(false);
      expect(result.paginationResult.hasPrev).toBe(false);
    });
  });
});
