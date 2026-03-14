/**
 * @fileoverview Test Setup
 * @module tests/setup
 */

// Global test setup - no jest.mock() calls here as they must be in test files
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});

afterAll(() => {
  // Cleanup after all tests
});
