/**
 * @fileoverview Tests for Chat Routes
 * @module tests/routes/chat
 */

import { jest } from '@jest/globals';
import request from 'supertest';

const mockConversation = {
  id: 'conv-1',
  workerId: 'worker-1',
  clientId: 'client-1',
  messageCounter: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockConversations = [
  {
    id: 'conv-1',
    messageCounter: 5,
    unreadCount: 2,
    lastMessage: { id: 'msg-1', content: 'Hello!' },
    partner: {
      id: 'client-1',
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      profileImageUrl: null,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'worker-1',
    messageNumber: 1,
    content: 'Hello!',
    type: 'TEXT',
    createdAt: new Date(),
    sender: {
      id: 'worker-1',
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      profileImageUrl: null,
    },
  },
];

jest.mock('../setup-db.js', () => ({
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
      count: jest.fn().mockResolvedValue(0),
    },
    session: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'session-1' }),
      update: jest.fn().mockResolvedValue({ id: 'session-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'session-1' }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(0),
    },
    government: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'gov-1', name: 'Cairo' }),
      update: jest.fn().mockResolvedValue({ id: 'gov-1', name: 'Updated' }),
      delete: jest.fn().mockResolvedValue({ id: 'gov-1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    city: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'city-1' }),
      update: jest.fn().mockResolvedValue({ id: 'city-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'city-1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    specialization: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'spec-1' }),
      update: jest.fn().mockResolvedValue({ id: 'spec-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'spec-1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    clientProfile: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'client-1' }),
      update: jest.fn().mockResolvedValue({ id: 'client-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'client-1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    workerProfile: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'worker-1' }),
      update: jest.fn().mockResolvedValue({ id: 'worker-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'worker-1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    workerVerification: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'verif-1' }),
      update: jest.fn().mockResolvedValue({ id: 'verif-1' }),
      delete: jest.fn().mockResolvedValue({ id: 'verif-1' }),
      count: jest.fn().mockResolvedValue(0),
    },
    conversation: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockConversation),
      update: jest.fn().mockResolvedValue(mockConversation),
      delete: jest.fn().mockResolvedValue(mockConversation),
      count: jest.fn().mockResolvedValue(0),
    },
    conversationParticipant: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    message: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
  },
}));

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
    eval: jest.fn().mockResolvedValue(1),
  },
}));

jest.mock('../../src/configs/environment.js', () => ({
  __esModule: true,
  default: {
    frontend: { url: 'http://localhost:3000' },
    jwt: {
      secret: 'test-secret',
      expiresIn: '1d',
      refreshSecret: 'test-refresh-secret',
      refreshExpiresIn: '7d',
    },
    redis: { url: 'redis://localhost:6379' },
    database: { url: 'postgresql://test:test@localhost:5432/test_db' },
  },
}));

const mockChatService = {
  getOrCreateConversation: jest.fn(),
  getConversations: jest.fn(),
  getMessages: jest.fn(),
  getMissedMessages: jest.fn(),
};

jest.mock('../../src/state.js', () => ({
  chatService: mockChatService,
}));

import initApp from '../../src/app.js';

describe('Chat Routes API Tests', () => {
  let app;

  beforeAll(async () => {
    app = await initApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chat/conversations', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set('X-Device-Fingerprint', 'abc123')
        .send({ workerId: 'worker-1', clientId: 'client-1' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid workerId format', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .send({ workerId: 'invalid', clientId: 'client-1' })
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject invalid clientId format', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          workerId: '550e8400-e29b-41d4-a716-446655440000',
          clientId: 'invalid',
        })
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject missing workerId', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .send({ clientId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject missing clientId', async () => {
      const response = await request(app)
        .post('/api/chat/conversations')
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .send({ workerId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/chat/conversations', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/chat/conversations')
        .set('X-Device-Fingerprint', 'abc123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/chat/conversations/unread', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/chat/conversations/unread')
        .set('X-Device-Fingerprint', 'abc123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/chat/conversations/:conversationId/messages', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get(
          '/api/chat/conversations/550e8400-e29b-41d4-a716-446655440000/messages'
        )
        .set('X-Device-Fingerprint', 'abc123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid conversationId format', async () => {
      const response = await request(app)
        .get('/api/chat/conversations/invalid/messages')
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });

    test('should accept valid conversationId', async () => {
      mockChatService.getMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get(
          '/api/chat/conversations/550e8400-e29b-41d4-a716-446655440000/messages'
        )
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .expect((res) => {
          expect([200, 401, 403, 404]).toContain(res.status);
        });
    });
  });

  describe('GET /api/chat/conversations/:conversationId/messages/missed', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get(
          '/api/chat/conversations/550e8400-e29b-41d4-a716-446655440000/messages/missed'
        )
        .set('X-Device-Fingerprint', 'abc123')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid conversationId format', async () => {
      const response = await request(app)
        .get('/api/chat/conversations/invalid/messages/missed')
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject missing after query param', async () => {
      const response = await request(app)
        .get(
          '/api/chat/conversations/550e8400-e29b-41d4-a716-446655440000/messages/missed'
        )
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });

    test('should reject negative after value', async () => {
      const response = await request(app)
        .get(
          '/api/chat/conversations/550e8400-e29b-41d4-a716-446655440000/messages/missed?after=-1'
        )
        .set('X-Device-Fingerprint', 'abc123')
        .set('Authorization', 'Bearer invalid-token')
        .expect(422);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
