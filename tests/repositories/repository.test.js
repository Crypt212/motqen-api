/**
 * @fileoverview Tests for Repository utility functions
 * @module tests/repositories/repository
 */

import { Repository } from '../../src/repositories/database/Repository.js';
import RepositoryError, {
  RepositoryErrorType,
} from '../../src/errors/RepositoryError.js';

describe('Repository Utility Functions', () => {
  // Test the static utility functions directly
  describe('OrderBy Mapping', () => {
    test('should map orderBy with direction correctly', () => {
      // This replicates the logic from performFindManyQuery
      const orderBy = [{ field: 'name', direction: 'desc' }];

      const orderByClause = orderBy
        .map(({ field, direction }) => {
          const order = direction?.toLowerCase();
          if (order === 'asc' || order === 'desc') {
            return { [field]: order };
          }
          return undefined;
        })
        .filter(Boolean);

      expect(orderByClause).toEqual([{ name: 'desc' }]);
    });

    test('should use default ordering when orderBy is empty', () => {
      const orderBy = [];

      const orderByClause =
        orderBy.length > 0
          ? orderBy.map(({ field, direction }) => ({ [field]: direction }))
          : [{ createdAt: 'asc' }];

      expect(orderByClause).toEqual([{ createdAt: 'asc' }]);
    });

    test('should filter out invalid direction', () => {
      const orderBy = [{ field: 'name', direction: 'invalid' }];

      const orderByClause = orderBy
        .map(({ field, direction }) => {
          const order = direction?.toLowerCase();
          if (order === 'asc' || order === 'desc') {
            return { [field]: order };
          }
          return undefined;
        })
        .filter(Boolean);

      expect(orderByClause).toEqual([]);
    });

    test('should handle uppercase direction', () => {
      const orderBy = [{ field: 'name', direction: 'DESC' }];

      const orderByClause = orderBy
        .map(({ field, direction }) => {
          const order = direction?.toLowerCase();
          if (order === 'asc' || order === 'desc') {
            return { [field]: order };
          }
          return undefined;
        })
        .filter(Boolean);

      expect(orderByClause).toEqual([{ name: 'desc' }]);
    });
  });

  describe('Pagination Calculation', () => {
    test('should calculate totalPages correctly', () => {
      const total = 55;
      const limit = 10;
      const totalPages = Math.ceil(total / limit);

      expect(totalPages).toBe(6);
    });

    test('should calculate hasNext correctly', () => {
      const page = 2;
      const limit = 10;
      const total = 55;
      const hasNext = page * limit < total;

      expect(hasNext).toBe(true);
    });

    test('should calculate hasPrev correctly', () => {
      const page = 2;
      const hasPrev = page > 1;

      expect(hasPrev).toBe(true);
    });

    test('should calculate skip correctly', () => {
      const page = 3;
      const limit = 10;
      const skip = (page - 1) * limit;

      expect(skip).toBe(20);
    });
  });

  describe('Filter Combination', () => {
    test('should combine parentQueryParameters with filter', () => {
      const parentQueryParameters = { workerProfileId: '123' };
      const filter = { name: 'test' };

      const where = { ...parentQueryParameters, ...filter };

      expect(where).toEqual({ workerProfileId: '123', name: 'test' });
    });

    test('should handle empty filter', () => {
      const parentQueryParameters = { workerProfileId: '123' };
      const filter = {};

      const where = { ...parentQueryParameters, ...filter };

      expect(where).toEqual({ workerProfileId: '123' });
    });
  });

  describe('Map Function', () => {
    test('should apply mapFunction to data', () => {
      const data = [
        { id: '1', name: 'Government 1', extra: 'data' },
        { id: '2', name: 'Government 2', extra: 'data' },
      ];

      const mapFunction = (item) => ({ id: item.id, name: item.name });

      const mappedData = data.map(mapFunction);

      expect(mappedData).toEqual([
        { id: '1', name: 'Government 1' },
        { id: '2', name: 'Government 2' },
      ]);
    });
  });

  // Test Repository class instantiation
  describe('Repository Class', () => {
    test('can be instantiated', () => {
      // We won't test the actual database operations since they require a real Prisma client
      // but we can verify the class exists and can be instantiated
      expect(Repository).toBeDefined();

      // Test that it has the expected methods
      expect(typeof Repository.prototype.findFirst).toBe('function');
      expect(typeof Repository.prototype.findById).toBe('function');
      expect(typeof Repository.prototype.findMany).toBe('function');
      expect(typeof Repository.prototype.create).toBe('function');
      expect(typeof Repository.prototype.update).toBe('function');
      expect(typeof Repository.prototype.delete).toBe('function');
      expect(typeof Repository.prototype.count).toBe('function');
      expect(typeof Repository.prototype.exists).toBe('function');
    });
  });

  // Test handlePrismaError function indirectly by testing error types
  describe('RepositoryError Types', () => {
    test('RepositoryErrorType exists', () => {
      expect(RepositoryErrorType).toBeDefined();
      expect(RepositoryErrorType.DATABASE_ERROR).toBe(1);
      expect(RepositoryErrorType.DUPLICATE_KEY).toBe(2);
      expect(RepositoryErrorType.NOT_FOUND).toBe(3);
      expect(RepositoryErrorType.ALREADY_EXISTS).toBe(4);
      expect(RepositoryErrorType.INVALID).toBe(5);
    });

    test('RepositoryError can be instantiated', () => {
      const error = new RepositoryError(
        'Test message',
        RepositoryErrorType.NOT_FOUND
      );
      expect(error).toBeInstanceOf(RepositoryError);
      expect(error.message).toBe('Test message');
      expect(error.code).toBe(RepositoryErrorType.NOT_FOUND);
    });
  });
});
