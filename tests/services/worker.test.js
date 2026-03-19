/**
 * @fileoverview Tests for Worker Service
 * @module tests/services/worker
 */

import { mockDeep } from 'jest-mock-extended';
import WorkerService from '../../src/services/WorkerService.js';

describe('WorkerService', () => {
  test('should be defined', () => {
    expect(WorkerService).toBeDefined();
  });

  test('should be a class', () => {
    expect(typeof WorkerService).toBe('function');
  });

  test('should have constructor that accepts workerRepository', () => {
    const mockWorkerRepository = mockDeep();
    const service = new WorkerService({
      workerRepository: mockWorkerRepository,
    });
    expect(service).toBeDefined();
  });
});
