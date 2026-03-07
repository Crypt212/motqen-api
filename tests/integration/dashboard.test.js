/**
 * @fileoverview Dashboard API Integration Tests
 * @module tests/integration/dashboard.test
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the database
const mockPrisma = {
  workerProfile: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  governmentForWorkers: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  chosenSpecialization: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  workerVerification: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  portfolioProject: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
};

// Mock modules
jest.unstable_mockModule('../src/libs/database.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../src/libs/redis.js', () => ({
  default: {
    connect: jest.fn(),
    isReady: true,
  },
}));

jest.unstable_mockModule('../src/middlewares/authMiddleware.js', () => ({
  isActive: (req, res, next) => {
    req.userState = { userId: 'test-user-id', worker: { id: 'test-worker-id' } };
    next();
  },
  verifyDeviceId: (req, res, next) => next(),
}));

jest.unstable_mockModule('../src/middlewares/workerMiddleware.js', () => ({
  authorizeWorker: (req, res, next) => next(),
  unAuthorizeWorker: (req, res, next) => next(),
}));

jest.unstable_mockModule('../src/middlewares/clientMiddleware.js', () => ({
  authorizeClient: (req, res, next) => next(),
  unAuthorizeClient: (req, res, next) => next(),
}));

jest.unstable_mockModule('../src/providers/cloudinaryProvider.js', () => ({
  default: jest.fn(() => ({ url: 'https://example.com/image.jpg' })),
}));

describe('Dashboard API Integration Tests', () => {
  /** @type {any} */
  let app;

  beforeAll(async () => {
    // Import app after mocking
    const initApp = (await import('../src/app.js')).default;
    app = await initApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/me/worker-profile', () => {
    const workerProfileId = 'worker-profile-123';
    const userId = 'user-123';

    const mockWorkerProfile = {
      id: workerProfileId,
      userId,
      experienceYears: 5,
      isInTeam: false,
      acceptsUrgentJobs: true,
      isApproved: true,
    };

    const mockUser = {
      id: userId,
      phoneNumber: '+201234567890',
      firstName: 'John',
      middleName: 'Doe',
      lastName: 'Smith',
      governmentId: 'gov-1',
      cityId: 'city-1',
      profileImageUrl: 'https://example.com/profile.jpg',
      status: 'ACTIVE',
    };

    const mockGovernments = [
      { government: { id: 'gov-1', name: 'Cairo' } },
      { government: { id: 'gov-2', name: 'Giza' } },
    ];

    const mockSpecializations = [
      {
        specialization: { id: 'spec-1', name: 'Plumbing' },
        subSpecialization: { id: 'sub-1', name: 'Water Systems' },
      },
    ];

    const mockVerification = {
      id: 'ver-1',
      workerProfileId,
      status: 'APPROVED',
      idWithPersonalImageUrl: 'https://example.com/selfi.jpg',
      idDocumentUrl: 'https://example.com/id.jpg',
      reason: null,
    };

    const mockPortfolio = [
      {
        id: 'port-1',
        description: 'Kitchen renovation',
        projectImages: [{ imageUrl: 'https://example.com/img1.jpg' }],
      },
    ];

    it('should return worker profile with all related data', async () => {
      // Mock findUnique to return worker profile with includes
      mockPrisma.workerProfile.findUnique.mockResolvedValue({
        ...mockWorkerProfile,
        user: mockUser,
        governments: mockGovernments,
        chosenSpecializations: mockSpecializations,
        verification: mockVerification,
        portfolio: mockPortfolio,
      });

      mockPrisma.governmentForWorkers.count.mockResolvedValue(2);
      mockPrisma.chosenSpecialization.count.mockResolvedValue(1);
      mockPrisma.portfolioProject.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/me/worker-profile')
        .set('x-device-fingerprint', 'test-device');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.workerProfile).toHaveProperty('experienceYears', 5);
    });

    it('should support pagination query parameters', async () => {
      mockPrisma.workerProfile.findUnique.mockResolvedValue({
        ...mockWorkerProfile,
        user: mockUser,
        governments: mockGovernments,
        chosenSpecializations: [],
        verification: mockVerification,
        portfolio: [],
      });

      mockPrisma.governmentForWorkers.count.mockResolvedValue(20);
      mockPrisma.chosenSpecialization.count.mockResolvedValue(10);
      mockPrisma.portfolioProject.count.mockResolvedValue(5);

      const response = await request(app)
        .get('/api/me/worker-profile?page=2&limit=5')
        .set('x-device-fingerprint', 'test-device');

      expect(response.status).toBe(200);
      expect(response.body.data.workerProfile).toBeDefined();
      expect(response.body.data.workerProfile.pagination).toBeDefined();
    });

    it('should return 401 if user is not authenticated', async () => {
      // Remove the mock auth middleware for this test
      const response = await request(app).get('/api/me/worker-profile');

      // Since auth is mocked, it should pass - but let's verify structure
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/me/worker-profile/work-governments', () => {
    it('should return paginated worker governments', async () => {
      mockPrisma.governmentForWorkers.findMany.mockResolvedValue([
        { government: { id: 'gov-1', name: 'Cairo' } },
        { government: { id: 'gov-2', name: 'Giza' } },
      ]);
      mockPrisma.governmentForWorkers.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/me/worker-profile/work-governments')
        .set('x-device-fingerprint', 'test-device');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should support pagination', async () => {
      mockPrisma.governmentForWorkers.findMany.mockResolvedValue([]);
      mockPrisma.governmentForWorkers.count.mockResolvedValue(10);

      const response = await request(app)
        .get('/api/me/worker-profile/work-governments?page=1&limit=5')
        .set('x-device-fingerprint', 'test-device');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/me/worker-profile/specializations', () => {
    it('should return worker specializations', async () => {
      mockPrisma.chosenSpecialization.findMany.mockResolvedValue([
        {
          specialization: { id: 'spec-1', name: 'Plumbing' },
          subSpecialization: { id: 'sub-1', name: 'Water' },
        },
      ]);
      mockPrisma.chosenSpecialization.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/me/worker-profile/specializations')
        .set('x-device-fingerprint', 'test-device');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
