import { describe, expect, it, vi, beforeEach } from 'vitest';
import LocationController from '../../src/controllers/LocationController.js';

describe('LocationController', () => {
  let locationController: LocationController;
  let mockLocationService: any;
  let mockReq: any;
  let mockRes: any;
  let mockSend: any;

  beforeEach(() => {
    mockLocationService = {
      getLocations: vi.fn(),
      createLocation: vi.fn(),
      getMainLocation: vi.fn(),
      updateLocation: vi.fn(),
      updateMainLocation: vi.fn(),
      getLocationById: vi.fn(),
      deleteLocation: vi.fn(),
    };

    locationController = new LocationController({ locationService: mockLocationService });

    mockReq = {
      userState: { userId: 'user-1' },
      query: {},
      body: {},
      params: {},
    };

    mockSend = vi.fn();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: mockSend,
    };
  });

  describe('list', () => {
    it('should call getLocations and return success response', async () => {
      const mockLocations = { locations: [], total: 0 };
      mockLocationService.getLocations.mockResolvedValue(mockLocations);

      // asyncHandler returns a function, so we need to await it
      await locationController.list(mockReq, mockRes, vi.fn());

      expect(mockLocationService.getLocations).toHaveBeenCalledWith({
        userId: 'user-1',
        filter: {},
        pagination: { page: 1, limit: 20 },
        sort: [],
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockLocations,
        })
      );
    });
  });

  describe('create', () => {
    it('should call createLocation and return success response', async () => {
      const dto = { address: '123 St' };
      mockReq.body = dto;
      const mockLocation = { id: 'loc-1', ...dto };
      mockLocationService.createLocation.mockResolvedValue(mockLocation);

      await locationController.create(mockReq, mockRes, vi.fn());

      expect(mockLocationService.createLocation).toHaveBeenCalledWith({
        userId: 'user-1',
        data: dto,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { location: mockLocation },
        })
      );
    });
  });

  describe('update', () => {
    it('should call updateLocation and return success response', async () => {
      const dto = { address: '456 St' };
      mockReq.body = dto;
      mockReq.params = { locationId: 'loc-1' };
      const mockLocation = { id: 'loc-1', ...dto };
      mockLocationService.updateLocation.mockResolvedValue(mockLocation);

      await locationController.update(mockReq, mockRes, vi.fn());

      expect(mockLocationService.updateLocation).toHaveBeenCalledWith({
        userId: 'user-1',
        locationId: 'loc-1',
        data: dto,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { location: mockLocation },
        })
      );
    });
  });

  describe('remove', () => {
    it('should call deleteLocation and return success response', async () => {
      mockReq.params = { locationId: 'loc-1' };
      mockLocationService.deleteLocation.mockResolvedValue(undefined);

      await locationController.remove(mockReq, mockRes, vi.fn());

      expect(mockLocationService.deleteLocation).toHaveBeenCalledWith({
        userId: 'user-1',
        locationId: 'loc-1',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
        })
      );
    });
  });
});
