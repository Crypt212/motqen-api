/**
 * @fileoverview Tests for Government Controller
 * @module tests/controllers/government
 */

import * as GovernmentController from '../../src/controllers/GovernmentController.js';

describe('GovernmentController', () => {
  describe('getGovernments', () => {
    test('should be defined', () => {
      expect(GovernmentController.getGovernments).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof GovernmentController.getGovernments).toBe('function');
    });
  });

  describe('getGovernmentById', () => {
    test('should be defined', () => {
      expect(GovernmentController.getGovernmentById).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof GovernmentController.getGovernmentById).toBe('function');
    });
  });

  describe('createGovernment', () => {
    test('should be defined', () => {
      expect(GovernmentController.createGovernment).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof GovernmentController.createGovernment).toBe('function');
    });
  });

  describe('updateGovernment', () => {
    test('should be defined', () => {
      expect(GovernmentController.updateGovernment).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof GovernmentController.updateGovernment).toBe('function');
    });
  });

  describe('deleteGovernment', () => {
    test('should be defined', () => {
      expect(GovernmentController.deleteGovernment).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof GovernmentController.deleteGovernment).toBe('function');
    });
  });

  describe('getCitiesByGovernment', () => {
    test('should be defined', () => {
      expect(GovernmentController.getCitiesByGovernment).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof GovernmentController.getCitiesByGovernment).toBe(
        'function'
      );
    });
  });
});
