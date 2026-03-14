/**
 * @fileoverview Tests for auth validators
 * @module tests/validators/auth
 */

import {
  SESSIONS_QUERY_CONFIG,
  USERS_QUERY_CONFIG
} from '../../src/validators/auth.js';

describe('Auth Validators', () => {
  describe('SESSIONS_QUERY_CONFIG', () => {
    test('should have allowedFilterFields', () => {
      expect(SESSIONS_QUERY_CONFIG.allowedFilterFields).toBeDefined();
      expect(Array.isArray(SESSIONS_QUERY_CONFIG.allowedFilterFields)).toBe(true);
    });

    test('should have filterFieldTypes', () => {
      expect(SESSIONS_QUERY_CONFIG.filterFieldTypes).toBeDefined();
      expect(typeof SESSIONS_QUERY_CONFIG.filterFieldTypes).toBe('object');
    });

    test('should have allowedOrderByFields', () => {
      expect(SESSIONS_QUERY_CONFIG.allowedOrderByFields).toBeDefined();
      expect(Array.isArray(SESSIONS_QUERY_CONFIG.allowedOrderByFields)).toBe(true);
    });

    test('should have allowedSearchFields', () => {
      expect(SESSIONS_QUERY_CONFIG.allowedSearchFields).toBeDefined();
      expect(Array.isArray(SESSIONS_QUERY_CONFIG.allowedSearchFields)).toBe(true);
    });
  });

  describe('USERS_QUERY_CONFIG', () => {
    test('should have allowedFilterFields', () => {
      expect(USERS_QUERY_CONFIG.allowedFilterFields).toBeDefined();
      expect(Array.isArray(USERS_QUERY_CONFIG.allowedFilterFields)).toBe(true);
    });

    test('should have filterFieldTypes', () => {
      expect(USERS_QUERY_CONFIG.filterFieldTypes).toBeDefined();
      expect(typeof USERS_QUERY_CONFIG.filterFieldTypes).toBe('object');
    });

    test('should have allowedOrderByFields', () => {
      expect(USERS_QUERY_CONFIG.allowedOrderByFields).toBeDefined();
      expect(Array.isArray(USERS_QUERY_CONFIG.allowedOrderByFields)).toBe(true);
    });

    test('should have allowedSearchFields', () => {
      expect(USERS_QUERY_CONFIG.allowedSearchFields).toBeDefined();
      expect(Array.isArray(USERS_QUERY_CONFIG.allowedSearchFields)).toBe(true);
    });
  });
});
