/**
 * @fileoverview Tests for Worker Service
 * @module tests/services/worker
 */

import WorkerService from '../../src/services/WorkerService.js';

describe('WorkerService', () => {
  test('should be defined', () => {
    expect(WorkerService).toBeDefined();
  });

  test('should be a class', () => {
    expect(typeof WorkerService).toBe('function');
  });

  test('should have constructor that accepts workerRepository', () => {
    const mockWorkerRepository = {};
    const service = new WorkerService({
      workerRepository: mockWorkerRepository,
    });
    expect(service).toBeDefined();
  });
});
