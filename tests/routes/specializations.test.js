/**
 * @fileoverview Specialization Routes API Tests
 * @module tests/routes/specializations
 */

import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the database before any imports happen
jest.mock('../../src/libs/database.js', () => ({
  __esModule: true,
  default: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((fn) => fn()),
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'test-id' }),
      update: jest.fn().mockResolvedValue({ id: 'test-id' }),
      delete: jest.fn().mockResolvedValue({ id: 'test-id' }),
      count: jest.fn().mockResolvedValue(0)
    },
    session: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'session-1' }),
      update: jest.fn().mockResolvedValue({ id: 'session-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'session-1' }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(0)
    },
    government: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'gov-1', name: 'Cairo' }),
      update: jest.fn().mockResolvedValue({ id: 'gov-1', name: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ id: 'gov-1' }),
      count: jest.fn().mockResolvedValue(0)
    },
    city: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'city-1' }),
      update: jest.fn().mockResolvedValue({ id: 'city-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'city-1' }),
      count: jest.fn().mockResolvedValue(0)
    },
    specialization: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'spec-1' }),
      update: jest.fn().mockResolvedValue({ id: 'spec-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'spec-1' }),
      count: jest.fn().mockResolvedValue(0)
    },
    clientProfile: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'client-1' }),
      update: jest.fn().mockResolvedValue({ id: 'client-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'client-1' }),
      count: jest.fn().mockResolvedValue(0)
    },
    workerProfile: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'worker-1' }),
      update: jest.fn().mockResolvedValue({ id: 'worker-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'worker-1' }),
      count: jest.fn().mockResolvedValue(0)
    },
    workerVerification: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'verif-1' }),
      update: jest.fn().mockResolvedValue({ id: 'verif-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'verif-1' }),
      count: jest.fn().mockResolvedValue(0)
    }
  }
}));

// Mock Redis
jest.mock('../../src/libs/redis.js', () => ({
  __esModule: true,
  default: {
    isReady: true,
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    incr: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(-1),
    expire: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(1)
  }
}));

// Mock environment
jest.mock('../../src/configs/environment.js', () => ({
  __esModule: true,
  default: {
    frontend: { url: 'http://localhost:3000' },
    jwt: { secret: 'test-secret', expiresIn: '1d', refreshSecret: 'test-refresh-secret', refreshExpiresIn: '7d' },
    redis: { url: 'redis://localhost:6379' },
    database: { url: 'postgresql://test:test@localhost:5432/test_db' }
  }
}));

// Import the app
import initApp from '../../src/app.js';

// Test device fingerprint for API requests
const TEST_DEVICE_FINGERPRINT = 'test-device-123';

describe('Specialization Routes API Tests', () => {
  let app;

  beforeAll(async () => {
    app = await initApp();
  });

  describe('GET /api/v1/specializations', () => {
    test('should return list of specializations', async () => {
      const response = await request(app)
        .get('/api/v1/specializations')
        .set('x-device-fingerprint', TEST_DEVICE_FINGERPRINT)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('specializations');
    });

    test('should accept pagination query params', async () => {
      const response = await request(app)
        .get('/api/v1/specializations?page=1&limit=10')
        .set('x-device-fingerprint', TEST_DEVICE_FINGERPRINT)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/v1/specializations/:id', () => {
    // test('should return specialization by id', async () => {
    //   const response = await request(app)
    //     .get('/api/v1/specializations/123e4567-e89b-12d3-a456-426614174000')
    //     .set('x-device-fingerprint', TEST_DEVICE_FINGERPRINT)
    //     .expect(200);
    //
    //   expect(response.body).toHaveProperty('data');
    // });

    test('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/v1/specializations/invalid-id')
        .set('x-device-fingerprint', TEST_DEVICE_FINGERPRINT)
        .expect(422);
    });

    // test('should return 404 for non-existent specialization', async () => {
    //   const response = await request(app)
    //     .get('/api/v1/specializations/123e4567-e89b-12d3-a456-426614174999')
    //     .set('x-device-fingerprint', TEST_DEVICE_FINGERPRINT)
    //     .expect(404);
    // });
  });

  // describe('GET /api/v1/specializations/:id/sub-specializations', () => {
  //   test('should return sub-specializations', async () => {
  //     const response = await request(app)
  //       .get('/api/v1/specializations/123e4567-e89b-12d3-a456-426614174000/sub-specializations')
  //       .set('x-device-fingerprint', TEST_DEVICE_FINGERPRINT)
  //       .expect(200);
  //
  //     expect(response.body).toHaveProperty('data');
  //   });
  // });
});
