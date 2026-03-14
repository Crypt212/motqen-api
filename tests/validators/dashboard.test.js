/**
 * @fileoverview Tests for dashboard validators
 * @module tests/validators/dashboard
 */

import {
  WORKER_GOVERNMENTS_QUERY_CONFIG,
  WORKER_SPECIALIZATIONS_QUERY_CONFIG,
  CLIENT_PROFILES_QUERY_CONFIG,
  WORKER_PROFILES_QUERY_CONFIG
} from '../../src/validators/dashboard.js';

describe('Dashboard Validators', () => {
  describe('WORKER_GOVERNMENTS_QUERY_CONFIG', () => {
    test('should have allowedFilterFields', () => {
      expect(WORKER_GOVERNMENTS_QUERY_CONFIG.allowedFilterFields).toContain('governmentId');
    });

    test('should have filterFieldTypes with uuid type', () => {
      expect(WORKER_GOVERNMENTS_QUERY_CONFIG.filterFieldTypes.governmentId.type).toBe('uuid');
    });

    test('should have allowedOrderByFields', () => {
      expect(WORKER_GOVERNMENTS_QUERY_CONFIG.allowedOrderByFields).toContain('createdAt');
    });

    test('should have empty allowedSearchFields', () => {
      expect(WORKER_GOVERNMENTS_QUERY_CONFIG.allowedSearchFields).toEqual([]);
    });
  });

  describe('WORKER_SPECIALIZATIONS_QUERY_CONFIG', () => {
    test('should have allowedFilterFields', () => {
      expect(WORKER_SPECIALIZATIONS_QUERY_CONFIG.allowedFilterFields).toContain('specializationId');
      expect(WORKER_SPECIALIZATIONS_QUERY_CONFIG.allowedFilterFields).toContain('mainId');
    });

    test('should have filterFieldTypes with uuid type', () => {
      expect(WORKER_SPECIALIZATIONS_QUERY_CONFIG.filterFieldTypes.specializationId.type).toBe('uuid');
      expect(WORKER_SPECIALIZATIONS_QUERY_CONFIG.filterFieldTypes.mainId.type).toBe('uuid');
    });

    test('should have allowedOrderByFields', () => {
      expect(WORKER_SPECIALIZATIONS_QUERY_CONFIG.allowedOrderByFields).toContain('createdAt');
    });

    test('should have empty allowedSearchFields', () => {
      expect(WORKER_SPECIALIZATIONS_QUERY_CONFIG.allowedSearchFields).toEqual([]);
    });
  });

  describe('CLIENT_PROFILES_QUERY_CONFIG', () => {
    test('should have allowedFilterFields', () => {
      expect(CLIENT_PROFILES_QUERY_CONFIG.allowedFilterFields).toContain('userId');
      expect(CLIENT_PROFILES_QUERY_CONFIG.allowedFilterFields).toContain('address');
    });

    test('should have filterFieldTypes with correct types', () => {
      expect(CLIENT_PROFILES_QUERY_CONFIG.filterFieldTypes.userId.type).toBe('uuid');
      expect(CLIENT_PROFILES_QUERY_CONFIG.filterFieldTypes.address.type).toBe('string');
      expect(CLIENT_PROFILES_QUERY_CONFIG.filterFieldTypes.address.minLength).toBe(2);
      expect(CLIENT_PROFILES_QUERY_CONFIG.filterFieldTypes.address.maxLength).toBe(500);
    });

    test('should have allowedOrderByFields', () => {
      expect(CLIENT_PROFILES_QUERY_CONFIG.allowedOrderByFields).toContain('createdAt');
      expect(CLIENT_PROFILES_QUERY_CONFIG.allowedOrderByFields).toContain('updatedAt');
      expect(CLIENT_PROFILES_QUERY_CONFIG.allowedOrderByFields).toContain('address');
    });

    test('should have allowedSearchFields', () => {
      expect(CLIENT_PROFILES_QUERY_CONFIG.allowedSearchFields).toContain('address');
    });
  });

  describe('WORKER_PROFILES_QUERY_CONFIG', () => {
    test('should have allowedFilterFields', () => {
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedFilterFields).toContain('userId');
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedFilterFields).toContain('experienceYears');
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedFilterFields).toContain('isInTeam');
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedFilterFields).toContain('acceptsUrgentJobs');
    });

    test('should have filterFieldTypes with correct types', () => {
      expect(WORKER_PROFILES_QUERY_CONFIG.filterFieldTypes.userId.type).toBe('uuid');
      expect(WORKER_PROFILES_QUERY_CONFIG.filterFieldTypes.experienceYears.type).toBe('number');
      expect(WORKER_PROFILES_QUERY_CONFIG.filterFieldTypes.experienceYears.min).toBe(0);
      expect(WORKER_PROFILES_QUERY_CONFIG.filterFieldTypes.experienceYears.max).toBe(50);
      expect(WORKER_PROFILES_QUERY_CONFIG.filterFieldTypes.isInTeam.type).toBe('boolean');
      expect(WORKER_PROFILES_QUERY_CONFIG.filterFieldTypes.acceptsUrgentJobs.type).toBe('boolean');
    });

    test('should have allowedOrderByFields', () => {
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedOrderByFields).toContain('createdAt');
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedOrderByFields).toContain('updatedAt');
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedOrderByFields).toContain('experienceYears');
    });

    test('should have empty allowedSearchFields', () => {
      expect(WORKER_PROFILES_QUERY_CONFIG.allowedSearchFields).toEqual([]);
    });
  });
});
