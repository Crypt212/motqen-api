/**
 * @fileoverview Tests for Specialization Controller
 * @module tests/controllers/specialization
 */

import * as SpecializationController from '../../src/controllers/SpecializationController.js';

describe('SpecializationController', () => {
  describe('getSpecializations', () => {
    test('should be defined', () => {
      expect(SpecializationController.getSpecializations).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.getSpecializations).toBe(
        'function'
      );
    });
  });

  describe('getSpecializationById', () => {
    test('should be defined', () => {
      expect(SpecializationController.getSpecializationById).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.getSpecializationById).toBe(
        'function'
      );
    });
  });

  describe('getSubSpecializations', () => {
    test('should be defined', () => {
      expect(SpecializationController.getSubSpecializations).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.getSubSpecializations).toBe(
        'function'
      );
    });
  });

  describe('createSpecialization', () => {
    test('should be defined', () => {
      expect(SpecializationController.createSpecialization).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.createSpecialization).toBe(
        'function'
      );
    });
  });

  describe('updateSpecialization', () => {
    test('should be defined', () => {
      expect(SpecializationController.updateSpecialization).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.updateSpecialization).toBe(
        'function'
      );
    });
  });

  describe('deleteSpecialization', () => {
    test('should be defined', () => {
      expect(SpecializationController.deleteSpecialization).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.deleteSpecialization).toBe(
        'function'
      );
    });
  });

  describe('createSubSpecialization', () => {
    test('should be defined', () => {
      expect(SpecializationController.createSubSpecialization).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.createSubSpecialization).toBe(
        'function'
      );
    });
  });

  describe('deleteSubSpecialization', () => {
    test('should be defined', () => {
      expect(SpecializationController.deleteSubSpecialization).toBeDefined();
    });

    test('should be a function', () => {
      expect(typeof SpecializationController.deleteSubSpecialization).toBe(
        'function'
      );
    });
  });
});
