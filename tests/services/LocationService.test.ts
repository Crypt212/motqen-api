import { describe, expect, it, vi, beforeEach } from 'vitest';
import LocationService from '../../src/services/LocationService.js';
import AppError from '../../src/errors/AppError.js';
import { TransactionManager } from '../../src/repositories/prisma/TransactionManager.js';

describe('LocationService', () => {
  let locationService: LocationService;
  let mockLocationRepository: any;
  let mockGovernmentRepository: any;
  let mockTransactionManager: any;

  beforeEach(() => {
    mockLocationRepository = {
      find: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      setAllNonMain: vi.fn(),
      findNextForPromotion: vi.fn(),
      isConnectedToOrder: vi.fn().mockResolvedValue(false),
      prismaClient: {
        $queryRaw: vi.fn(),
      },
    };

    mockGovernmentRepository = {
      find: vi.fn(),
      findCity: vi.fn(),
    };

    mockTransactionManager = {
      execute: vi.fn().mockImplementation(async (repos, callback) => {
        return callback({ locationRepo: mockLocationRepository });
      }),
      executeWithLocks: vi.fn().mockImplementation(async (locks, repos, callback) => {
        return callback({ locationRepo: mockLocationRepository });
      }),
    };

    locationService = new LocationService({
      locationRepository: mockLocationRepository,
      governmentRepository: mockGovernmentRepository,
      transactionManager: mockTransactionManager,
    });
  });

  describe('createLocation', () => {
    const validData = {
      address: '123 St',
      governmentId: 'gov-1',
      cityId: 'city-1',
      long: 31.0,
      lat: 30.0,
      isMain: true,
    };

    it('should validate government and city, then create location', async () => {
      mockGovernmentRepository.find.mockResolvedValue({ id: 'gov-1' });
      mockGovernmentRepository.findCity.mockResolvedValue({ id: 'city-1', governmentId: 'gov-1' });
      mockLocationRepository.create.mockResolvedValue({
        ...validData,
        id: 'loc-1',
        userId: 'user-1',
      });

      const result = await locationService.createLocation({ userId: 'user-1', data: validData });

      expect(mockGovernmentRepository.find).toHaveBeenCalledWith({ filter: { id: 'gov-1' } });
      expect(mockGovernmentRepository.findCity).toHaveBeenCalledWith({
        filter: { id: 'city-1', governmentId: 'gov-1' },
      });
      expect(mockTransactionManager.execute).toHaveBeenCalled();
      expect(result.id).toBe('loc-1');
    });

    it('should throw if government does not exist', async () => {
      mockGovernmentRepository.find.mockResolvedValue(null);

      await expect(
        locationService.createLocation({ userId: 'user-1', data: validData })
      ).rejects.toThrow(AppError);
    });

    it('should throw if city does not exist or does not belong to government', async () => {
      mockGovernmentRepository.find.mockResolvedValue({ id: 'gov-1' });
      mockGovernmentRepository.findCity.mockResolvedValue(null);

      await expect(
        locationService.createLocation({ userId: 'user-1', data: validData })
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateLocation', () => {
    it('should throw if location does not exist', async () => {
      mockLocationRepository.find.mockResolvedValue(null);

      await expect(
        locationService.updateLocation({ userId: 'user-1', locationId: 'loc-1', data: {} })
      ).rejects.toThrow(AppError);
    });

    it('should throw if location does not belong to user', async () => {
      mockLocationRepository.find.mockResolvedValue({ id: 'loc-1', userId: 'other-user' });

      await expect(
        locationService.updateLocation({ userId: 'user-1', locationId: 'loc-1', data: {} })
      ).rejects.toThrow(AppError);
    });

    it('should validate government and city if updating both', async () => {
      mockLocationRepository.find.mockResolvedValue({
        id: 'loc-1',
        userId: 'user-1',
        governmentId: 'gov-1',
        cityId: 'city-1',
      });
      mockGovernmentRepository.find.mockResolvedValue({ id: 'gov-2' });
      mockGovernmentRepository.findCity.mockResolvedValue({ id: 'city-2', governmentId: 'gov-2' });
      mockLocationRepository.update.mockResolvedValue({ id: 'loc-1', userId: 'user-1' });

      await locationService.updateLocation({
        userId: 'user-1',
        locationId: 'loc-1',
        data: { governmentId: 'gov-2', cityId: 'city-2' },
      });

      expect(mockGovernmentRepository.find).toHaveBeenCalled();
      expect(mockGovernmentRepository.findCity).toHaveBeenCalled();
      expect(mockLocationRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteLocation', () => {
    it('should throw if location does not exist or does not belong to user', async () => {
      mockLocationRepository.find.mockResolvedValue(null);

      await expect(
        locationService.deleteLocation({ userId: 'user-1', locationId: 'loc-1' })
      ).rejects.toThrow(AppError);
    });

    it('should delete non-main location normally', async () => {
      mockLocationRepository.find.mockResolvedValue({
        id: 'loc-1',
        userId: 'user-1',
        isMain: false,
      });

      await locationService.deleteLocation({ userId: 'user-1', locationId: 'loc-1' });

      expect(mockLocationRepository.delete).toHaveBeenCalledWith({ filter: { id: 'loc-1' } });
    });

    it('should delete main location and promote the next one', async () => {
      mockLocationRepository.find.mockResolvedValue({
        id: 'loc-1',
        userId: 'user-1',
        isMain: true,
      });
      mockLocationRepository.findNextForPromotion.mockResolvedValue({ id: 'loc-2' });

      await locationService.deleteLocation({ userId: 'user-1', locationId: 'loc-1' });

      expect(mockTransactionManager.execute).toHaveBeenCalled();
      expect(mockLocationRepository.delete).toHaveBeenCalledWith({ filter: { id: 'loc-1' } });
      expect(mockLocationRepository.findNextForPromotion).toHaveBeenCalledWith({
        userId: 'user-1',
        excludeId: 'loc-1',
      });
      expect(mockLocationRepository.update).toHaveBeenCalledWith({
        filter: { id: 'loc-2' },
        location: { isMain: true },
      });
    });
  });
});
