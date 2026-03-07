/**
 * @fileoverview WorkerService Unit Tests
 * @module tests/unit/WorkerService.test
 */

import { jest } from '@jest/globals';

// Mock AppError
const mockAppError = jest.fn((message, statusCode, info) => {
  this.message = message;
  this.statusCode = statusCode;
  this.info = info;
});
mockAppError.prototype = Error.prototype;

// Mock the modules before importing the service
jest.unstable_mockModule('../src/errors/AppError.js', () => ({
  default: mockAppError,
}));

jest.unstable_mockModule('../src/repositories/database/Repository.js', () => ({
  Repository: class {
    static createTransaction() {}
  },
}));

describe('WorkerService', () => {
  /** @type {any} */
  let WorkerService;
  /** @type {any} */
  let mockUserRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create mock user repository
    mockUserRepository = {
      findWorkerProfile: jest.fn(),
      findWorkerProfileWithUser: jest.fn(),
      findWorkerProfileWithGovernments: jest.fn(),
      findWorkerProfileWithSpecializations: jest.fn(),
      findWorkerProfileWithVerification: jest.fn(),
      findWorkerProfileWithPortfolio: jest.fn(),
      getWorkerDashboard: jest.fn(),
      countWorkerGovernments: jest.fn(),
      countWorkerSpecializations: jest.fn(),
      countWorkerPortfolio: jest.fn(),
      findWorkerProfileGovernments: jest.fn(),
      findWorkerProfileSpecializations: jest.fn(),
    };

    // Import WorkerService after mocking
    const module = await import('../src/services/WorkerService.js');
    WorkerService = module.default;
  });

  describe('getDashboard', () => {
    const workerProfileId = 'worker-profile-123';

    it('should return worker dashboard data with default pagination', async () => {
      const mockDashboard = {
        id: workerProfileId,
        experienceYears: 5,
        isInTeam: false,
        acceptsUrgentJobs: true,
        isApproved: true,
        user: { id: 'user-123', firstName: 'John' },
        governments: [{ id: 'gov-1', name: 'Cairo' }],
        specializations: [{ id: 'spec-1', name: 'Plumbing', subSpecializations: [] }],
        verification: { id: 'ver-1', status: 'APPROVED' },
        portfolio: [],
      };

      mockUserRepository.getWorkerDashboard.mockResolvedValue(mockDashboard);
      mockUserRepository.countWorkerGovernments.mockResolvedValue(1);
      mockUserRepository.countWorkerSpecializations.mockResolvedValue(1);
      mockUserRepository.countWorkerPortfolio.mockResolvedValue(0);

      const service = new WorkerService({ userRepository: mockUserRepository });
      const result = await service.getDashboard({ workerProfileId });

      expect(result).toHaveProperty('experienceYears', 5);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('governments');
      expect(result).toHaveProperty('specializations');
      expect(result).toHaveProperty('pagination');
    });

    it('should return worker dashboard with custom pagination', async () => {
      const mockDashboard = {
        id: workerProfileId,
        experienceYears: 5,
        isInTeam: false,
        acceptsUrgentJobs: true,
        isApproved: true,
      };

      mockUserRepository.getWorkerDashboard.mockResolvedValue(mockDashboard);
      mockUserRepository.countWorkerGovernments.mockResolvedValue(10);
      mockUserRepository.countWorkerSpecializations.mockResolvedValue(10);
      mockUserRepository.countWorkerPortfolio.mockResolvedValue(10);

      const service = new WorkerService({ userRepository: mockUserRepository });
      const result = await service.getDashboard({
        workerProfileId,
        pagination: { page: 2, limit: 5 }
      });

      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page', 2);
      expect(result.pagination).toHaveProperty('limit', 5);
    });

    it('should filter fields when fields parameter is provided', async () => {
      const mockDashboard = {
        id: workerProfileId,
        experienceYears: 5,
        isInTeam: false,
        acceptsUrgentJobs: true,
        isApproved: true,
        user: { id: 'user-123' },
        governments: [],
        specializations: [],
,
        portfolio:        verification: null [],
      };

      mockUserRepository.getWorkerDashboard.mockResolvedValue(mockDashboard);
      mockUserRepository.countWorkerGovernments.mockResolvedValue(0);
      mockUserRepository.countWorkerSpecializations.mockResolvedValue(0);
      mockUserRepository.countWorkerPortfolio.mockResolvedValue(0);

      const service = new WorkerService({ userRepository: mockUserRepository });
      const result = await service.getDashboard({
        workerProfileId,
        filters: { fields: ['experienceYears', 'isApproved'] }
      });

      expect(result).toHaveProperty('experienceYears', 5);
      expect(result).toHaveProperty('isApproved', true);
      expect(result).not.toHaveProperty('user');
      expect(result).not.toHaveProperty('governments');
    });

    it('should throw error when worker profile not found', async () => {
      mockUserRepository.getWorkerDashboard.mockResolvedValue(null);

      const service = new WorkerService({ userRepository: mockUserRepository });

      await expect(service.getDashboard({ workerProfileId }))
        .rejects.toThrow('Worker profile not found');
    });

    it('should include only requested related data', async () => {
      const mockDashboard = {
        id: workerProfileId,
        experienceYears: 5,
        isInTeam: false,
        acceptsUrgentJobs: true,
        isApproved: true,
      };

      mockUserRepository.getWorkerDashboard.mockResolvedValue(mockDashboard);
      mockUserRepository.countWorkerGovernments.mockResolvedValue(0);
      mockUserRepository.countWorkerSpecializations.mockResolvedValue(0);
      mockUserRepository.countWorkerPortfolio.mockResolvedValue(0);

      const service = new WorkerService({ userRepository: mockUserRepository });
      const result = await service.getDashboard({
        workerProfileId,
        filters: { include: ['user', 'governments'] }
      });

      expect(mockUserRepository.getWorkerDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining(['user', 'governments']),
        })
      );
    });
  });

  describe('getWorkGovernments', () => {
    const workerProfileId = 'worker-profile-123';

    it('should return paginated governments', async () => {
      const mockGovernments = [
        { id: 'gov-1', name: 'Cairo' },
        { id: 'gov-2', name: 'Giza' },
      ];

      mockUserRepository.findWorkerProfileGovernments.mockResolvedValue(mockGovernments);
      mockUserRepository.countWorkerGovernments.mockResolvedValue(2);

      const service = new WorkerService({ userRepository: mockUserRepository });
      const result = await service.getWorkGovernments({
        workerProfileId,
        pagination: { page: 1, limit: 10 }
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toHaveProperty('total', 2);
    });

    it('should calculate correct pagination metadata', async () => {
      const mockGovernments = [{ id: 'gov-1', name: 'Cairo' }];

      mockUserRepository.findWorkerProfileGovernments.mockResolvedValue(mockGovernments);
      mockUserRepository.countWorkerGovernments.mockResolvedValue(15);

      const service = new WorkerService({ userRepository: mockUserRepository });
      const result = await service.getWorkGovernments({
        workerProfileId,
        pagination: { page: 2, limit: 5 }
      });

      expect(result.pagination).toHaveProperty('page', 2);
      expect(result.pagination).toHaveProperty('limit', 5);
      expect(result.pagination).toHaveProperty('total', 15);
      expect(result.pagination).toHaveProperty('totalPages', 3);
      expect(result.pagination).toHaveProperty('hasNextPage', true);
      expect(result.pagination).toHaveProperty('hasPrevPage', true);
    });
  });

  describe('getSpecializations', () => {
    const workerProfileId = 'worker-profile-123';

    it('should return paginated specializations', async () => {
      const mockSpecializations = [
        { mainId: 'spec-1', mainName: 'Plumbing', subIds: [{ id: 'sub-1', name: 'Water' }] },
      ];

      mockUserRepository.findWorkerProfileSpecializations.mockResolvedValue(mockSpecializations);
      mockUserRepository.countWorkerSpecializations.mockResolvedValue(1);

      const service = new WorkerService({ userRepository: mockUserRepository });
      const result = await service.getSpecializations({
        workerProfileId,
        pagination: { page: 1, limit: 10 }
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
    });

    it('should filter by main specialization IDs', async () => {
      const mockSpecializations = [
        { mainId: 'spec-1', mainName: 'Plumbing', subIds: [] },
      ];

      mockUserRepository.findWorkerProfileSpecializations.mockResolvedValue(mockSpecializations);
      mockUserRepository.countWorkerSpecializations.mockResolvedValue(1);

      const service = new WorkerService({ userRepository: mockUserRepository });
      await service.getSpecializations({
        workerProfileId,
        mainSpecializationIds: ['spec-1'],
        pagination: { page: 1, limit: 10 }
      });

      expect(mockUserRepository.findWorkerProfileSpecializations).toHaveBeenCalledWith(
        expect.objectContaining({
          mainSpecializationIds: ['spec-1'],
        })
      );
    });
  });
});
