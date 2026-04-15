/**
 * Global test setup — shared across all test files.
 * Sets environment variables before any module is loaded.
 */
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.JWT_LOGIN_SECRET = 'test-login-secret';
  process.env.JWT_REGISTER_SECRET = 'test-register-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.PORT = '3000';
});
