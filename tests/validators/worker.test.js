/**
 * @fileoverview Tests for worker validators
 * @module tests/validators/worker
 */

import {
  WORKER_SEARCH_QUERY_CONFIG,
  validateSearchWorkers,
  validateGetWorkerById,
} from '../../src/validators/worker.js';

describe('WORKER_SEARCH_QUERY_CONFIG', () => {
  test('should have correct allowedFilterFields', () => {
    expect(WORKER_SEARCH_QUERY_CONFIG.allowedFilterFields).toContain(
      'subSpecializationId'
    );
    expect(WORKER_SEARCH_QUERY_CONFIG.allowedFilterFields).toContain(
      'governmentId'
    );
    expect(WORKER_SEARCH_QUERY_CONFIG.allowedFilterFields).toContain(
      'acceptsUrgentJobs'
    );
  });

  test('should have correct filterFieldTypes', () => {
    expect(
      WORKER_SEARCH_QUERY_CONFIG.filterFieldTypes.subSpecializationId.type
    ).toBe('uuid');
    expect(WORKER_SEARCH_QUERY_CONFIG.filterFieldTypes.governmentId.type).toBe(
      'uuid'
    );
    expect(
      WORKER_SEARCH_QUERY_CONFIG.filterFieldTypes.acceptsUrgentJobs.type
    ).toBe('boolean');
  });
});

describe('validateSearchWorkers', () => {
  test('should be defined', () => {
    expect(validateSearchWorkers).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateSearchWorkers)).toBe(true);
  });

  test('should have validators for query params', () => {
    expect(validateSearchWorkers.length).toBeGreaterThanOrEqual(5);
  });
});

describe('validateGetWorkerById', () => {
  test('should be defined', () => {
    expect(validateGetWorkerById).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateGetWorkerById)).toBe(true);
  });

  test('should have id param validator', () => {
    expect(validateGetWorkerById.length).toBe(1);
  });
});
