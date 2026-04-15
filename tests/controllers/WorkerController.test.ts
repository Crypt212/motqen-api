/**
 * @fileoverview Tests for Worker Controller
 * @module tests/controllers/worker
 */

import * as WorkerController from '../../src/controllers/WorkerController.js';

describe('WorkerController', () => {
  describe('searchWorkers', () => {
    test('should be defined', () => {
      expect(WorkerController.searchWorkers).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof WorkerController.searchWorkers).toBe('function');
    });
  });

  describe('getWorkerById', () => {
    test('should be defined', () => {
      expect(WorkerController.getWorkerById).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof WorkerController.getWorkerById).toBe('function');
    });
  });
});
