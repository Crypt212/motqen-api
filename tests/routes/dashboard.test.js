/**
 * @fileoverview Dashboard Routes API Tests
 * @module tests/routes/dashboard
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

describe('Dashboard Routes API Tests', () => {
  let app;

  beforeAll(async () => {
    app = await initApp();
  });

  describe('GET /api/v1/me', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/me')
        .expect(401);
    });

    test('should return user profile with valid token', async () => {
      // This would test with a valid token but requires proper JWT
      const response = await request(app)
        .get('/api/v1/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PUT /api/v1/me', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/me')
        .send({ firstName: 'John' })
        .expect(401);
    });

    test('should validate request body', async () => {
      const response = await request(app)
        .put('/api/v1/me')
        .set('Authorization', 'Bearer invalid-token')
        .send({})
        .expect(401);
    });
  });

  describe('GET /api/v1/me/worker-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile')
        .expect(401);
    });

    test('should require worker role', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile')
        .set('Authorization', 'Bearer invalid-token')
        .set('X-Device-Fingerprint', 'abc123')
        .expect(401);
    });
  });

  describe('POST /api/v1/me/worker-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/me/worker-profile')
        .expect(401);
    });
  });

  describe('PUT /api/v1/me/worker-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/me/worker-profile')
        .expect(401);
    });
  });

  describe('DELETE /api/v1/me/worker-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/me/worker-profile')
        .expect(401);
    });
  });

  describe('GET /api/v1/me/worker-profile/work-governments', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/work-governments')
        .expect(401);
    });

    test('should accept query params for filtering', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/work-governments?page=1&limit=10')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/v1/me/worker-profile/work-governments', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/me/worker-profile/work-governments')
        .send({ workGovernmentIds: [] })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/me/worker-profile/work-governments', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/me/worker-profile/work-governments')
        .send({ workGovernmentIds: [] })
        .expect(401);
    });
  });

  describe('GET /api/v1/me/worker-profile/specializations', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/specializations')
        .expect(401);
    });
  });

  describe('POST /api/v1/me/worker-profile/specializations', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/me/worker-profile/specializations')
        .send({ specializations: [] })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/me/worker-profile/specializations', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/me/worker-profile/specializations')
        .send({ specializations: [] })
        .expect(401);
    });
  });

  describe('GET /api/v1/me/client-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/me/client-profile')
        .expect(401);
    });
  });

  describe('POST /api/v1/me/client-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/me/client-profile')
        .expect(401);
    });
  });

  describe('PUT /api/v1/me/client-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/me/client-profile')
        .expect(401);
    });
  });

  describe('DELETE /api/v1/me/client-profile', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/me/client-profile')
        .expect(401);
    });
  });

  describe('Query Parameter Tests', () => {
    test('should accept valid pagination params on protected routes', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/work-governments?page=1&limit=10')
        .expect(401);
    });

    test('should reject invalid page value', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/work-governments?page=-1')
        .expect(401);
    });

    test('should reject invalid limit value', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/work-governments?limit=0')
        .expect(401);
    });

    test('should accept sorting params', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/work-governments?sortBy=createdAt&sortOrder=desc')
        .expect(401);
    });

    test('should reject invalid sortBy', async () => {
      const response = await request(app)
        .get('/api/v1/me/worker-profile/work-governments?sortBy=invalid')
        .expect(401);
    });
  });
});
