import { describe, expect, it, vi, beforeEach } from 'vitest';
import LocationRepository from '../../src/repositories/prisma/LocationRepository.js';
import { Prisma } from '../../src/generated/prisma/client.js';

describe('LocationRepository', () => {
  let repository: LocationRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      location: {
        count: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        updateMany: vi.fn(),
        findFirst: vi.fn(),
      },
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn(),
    };
    repository = new LocationRepository(prismaMock);
  });

  describe('exists', () => {
    it('should return true if count > 0', async () => {
      prismaMock.location.count.mockResolvedValue(1);
      const result = await repository.exists({ filter: { userId: 'user-1' } });
      expect(result).toBe(true);
      expect(prismaMock.location.count).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });

    it('should return false if count is 0', async () => {
      prismaMock.location.count.mockResolvedValue(0);
      const result = await repository.exists({ filter: { userId: 'user-1' } });
      expect(result).toBe(false);
    });
  });

  describe('find', () => {
    it('should return location when found via raw SQL', async () => {
      const mockRecord = {
        id: 'loc-1',
        userId: 'user-1',
        governmentId: 'gov-1',
        cityId: 'city-1',
        address: '123 St',
        addressNotes: null,
        isMain: true,
        createdAt: new Date(),
        long: 31.0,
        lat: 30.0,
      };
      prismaMock.$queryRaw.mockResolvedValue([mockRecord]);

      const result = await repository.find({ filter: { id: 'loc-1' } });
      expect(result).toMatchObject({
        id: 'loc-1',
        long: 31.0,
        lat: 30.0,
      });
      expect(prismaMock.$queryRaw).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);
      const result = await repository.find({ filter: { id: 'loc-1' } });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create location using raw SQL, set pointGeography, and return the location', async () => {
      const createData = {
        userId: 'user-1',
        governmentId: 'gov-1',
        cityId: 'city-1',
        address: '123 St',
        addressNotes: 'notes',
        long: 31.0,
        lat: 30.0,
        isMain: true,
      };

      const mockRecord = { ...createData, id: 'new-loc-1', createdAt: new Date() };

      // First call is INSERT via $queryRaw
      prismaMock.$queryRaw.mockResolvedValueOnce([mockRecord]);
      // Second call is find via $queryRaw
      prismaMock.$queryRaw.mockResolvedValueOnce([mockRecord]);

      prismaMock.$executeRaw.mockResolvedValue(1);

      const result = await repository.create({ location: createData });

      expect(prismaMock.$queryRaw).toHaveBeenCalled();
      expect(prismaMock.$executeRaw).toHaveBeenCalled();
      expect(result.id).toBe('new-loc-1');
    });
  });

  describe('update', () => {
    it('should update location and pointGeography if coords are provided', async () => {
      const updateData = {
        long: 32.0,
        lat: 31.0,
        address: 'new address',
      };

      prismaMock.location.update.mockResolvedValue({ id: 'loc-1' });
      prismaMock.$executeRaw.mockResolvedValue(1);
      prismaMock.$queryRaw.mockResolvedValue([
        { id: 'loc-1', address: 'new address', long: 32.0, lat: 31.0, createdAt: new Date() },
      ]);

      const result = await repository.update({ filter: { id: 'loc-1' }, location: updateData });

      expect(prismaMock.location.update).toHaveBeenCalledWith({
        where: { id: 'loc-1' },
        data: { address: 'new address' },
      });
      expect(prismaMock.$executeRaw).toHaveBeenCalled();
      expect(result.id).toBe('loc-1');
    });
  });

  describe('delete', () => {
    it('should delete a location', async () => {
      prismaMock.location.delete.mockResolvedValue({ id: 'loc-1' });
      await repository.delete({ filter: { id: 'loc-1' } });
      expect(prismaMock.location.delete).toHaveBeenCalledWith({
        where: { id: 'loc-1' },
      });
    });
  });

  describe('setAllNonMain', () => {
    it('should update all locations for a user to isMain = false', async () => {
      prismaMock.location.updateMany.mockResolvedValue({ count: 2 });
      await repository.setAllNonMain({ userId: 'user-1' });
      expect(prismaMock.location.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { isMain: false },
      });
    });
  });

  describe('findNextForPromotion', () => {
    it('should find the most recent location excluding the given id', async () => {
      prismaMock.location.findFirst.mockResolvedValue({ id: 'loc-2' });
      prismaMock.$queryRaw.mockResolvedValue([
        { id: 'loc-2', createdAt: new Date(), isMain: false },
      ]);

      const result = await repository.findNextForPromotion({
        userId: 'user-1',
        excludeId: 'loc-1',
      });

      expect(prismaMock.location.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', id: { not: 'loc-1' } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result?.id).toBe('loc-2');
    });

    it('should return null if no other locations exist', async () => {
      prismaMock.location.findFirst.mockResolvedValue(null);

      const result = await repository.findNextForPromotion({
        userId: 'user-1',
        excludeId: 'loc-1',
      });
      expect(result).toBeNull();
    });
  });
});
