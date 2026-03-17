/**
 * @fileoverview Tests for auth validators
 * @module tests/validators/auth
 */

import {
  SESSIONS_QUERY_CONFIG,
  USERS_QUERY_CONFIG,
  validateRequestOTP,
  validateVerifyOTP,
  validateRegisterClient,
  validateRegisterWorker,
  validateLogin,
  validateReviewStatus,
  validateGenerateAccessToken,
  validateLogout,
  validateListSessions,
  validateListUsers,
} from '../../src/validators/auth.js';

describe('SESSIONS_QUERY_CONFIG', () => {
  test('should have correct allowedFilterFields', () => {
    expect(SESSIONS_QUERY_CONFIG.allowedFilterFields).toContain('userId');
    expect(SESSIONS_QUERY_CONFIG.allowedFilterFields).toContain('deviceId');
    expect(SESSIONS_QUERY_CONFIG.allowedFilterFields).toContain('isRevoked');
  });

  test('should have correct filterFieldTypes', () => {
    expect(SESSIONS_QUERY_CONFIG.filterFieldTypes.userId.type).toBe('uuid');
    expect(SESSIONS_QUERY_CONFIG.filterFieldTypes.isRevoked.type).toBe(
      'boolean'
    );
  });
});

describe('USERS_QUERY_CONFIG', () => {
  test('should have correct allowedFilterFields', () => {
    expect(USERS_QUERY_CONFIG.allowedFilterFields).toContain('role');
    expect(USERS_QUERY_CONFIG.allowedFilterFields).toContain('status');
    expect(USERS_QUERY_CONFIG.allowedFilterFields).toContain('phoneNumber');
  });

  test('should have correct filterFieldTypes for role', () => {
    expect(USERS_QUERY_CONFIG.filterFieldTypes.role.type).toBe('enum');
    expect(USERS_QUERY_CONFIG.filterFieldTypes.role.enumValues).toContain(
      'USER'
    );
    expect(USERS_QUERY_CONFIG.filterFieldTypes.role.enumValues).toContain(
      'ADMIN'
    );
  });
});

describe('validateRequestOTP', () => {
  test('should be defined', () => {
    expect(validateRequestOTP).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateRequestOTP)).toBe(true);
  });

  test('should have validators for phoneNumber and method', () => {
    expect(validateRequestOTP.length).toBe(2);
  });
});

describe('validateVerifyOTP', () => {
  test('should be defined', () => {
    expect(validateVerifyOTP).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateVerifyOTP)).toBe(true);
  });

  test('should have validators for phoneNumber, otp, and method', () => {
    expect(validateVerifyOTP.length).toBe(3);
  });
});

describe('validateRegisterClient', () => {
  test('should be defined', () => {
    expect(validateRegisterClient).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateRegisterClient)).toBe(true);
  });
});

describe('validateRegisterWorker', () => {
  test('should be defined', () => {
    expect(validateRegisterWorker).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateRegisterWorker)).toBe(true);
  });
});

describe('validateLogin', () => {
  test('should be defined', () => {
    expect(validateLogin).toBeDefined();
  });
});

describe('validateReviewStatus', () => {
  test('should be defined', () => {
    expect(validateReviewStatus).toBeDefined();
  });
});

describe('validateGenerateAccessToken', () => {
  test('should be defined', () => {
    expect(validateGenerateAccessToken).toBeDefined();
  });
});

describe('validateLogout', () => {
  test('should be defined', () => {
    expect(validateLogout).toBeDefined();
  });
});

describe('validateListSessions', () => {
  test('should be defined', () => {
    expect(validateListSessions).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateListSessions)).toBe(true);
  });
});

describe('validateListUsers', () => {
  test('should be defined', () => {
    expect(validateListUsers).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateListUsers)).toBe(true);
  });
});
