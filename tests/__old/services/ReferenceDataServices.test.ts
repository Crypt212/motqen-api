/**
 * GovernmentService & SpecializationService Tests
 *
 * These are the reference-data services — governments (Egyptian governorates)
 * and specializations (trade categories like electricity, plumbing).
 * They share the same CRUD pattern with existence checks before mutate.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import GovernmentService from '../../src/services/GovernmentService.js';
import SpecializationService from '../../src/services/SpecializationService.js';
import AppError from '../../src/errors/AppError.js';
import {
  createMockGovernmentRepository,
  createMockSpecializationRepository,
  makeGovernment,
  makeSpecialization,
} from '../helpers/mocks.js';

describe('GovernmentService', () => {
  let service: GovernmentService;
  let repo: ReturnType<typeof createMockGovernmentRepository>;

  beforeEach(() => {
    repo = createMockGovernmentRepository();
    service = new GovernmentService({ governmentRepository: repo });
  });

  describe('getGovernmentById', () => {
    it('should return government when found', async () => {
      const gov = makeGovernment();
      repo.find.mockResolvedValue(gov);

      const result = await service.getGovernmentById({ id: 'gov-1' });
      expect(result).toEqual(gov);
    });

    it('should throw 404 when government not found', async () => {
      repo.find.mockResolvedValue(null);

      await expect(service.getGovernmentById({ id: 'nope' })).rejects.toThrow(
        'Government not found'
      );
    });
  });

  describe('updateGovernment', () => {
    it('should check existence before updating', async () => {
      repo.find.mockResolvedValue(null);

      await expect(
        service.updateGovernment({ id: 'nope', data: { name: 'New name' } })
      ).rejects.toThrow('Government not found');

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should update when government exists', async () => {
      const gov = makeGovernment();
      repo.find.mockResolvedValue(gov);
      repo.update.mockResolvedValue({ ...gov, name: 'Alexandria' });

      const result = await service.updateGovernment({
        id: 'gov-1',
        data: { name: 'Alexandria' },
      });

      expect(result.name).toBe('Alexandria');
    });
  });

  describe('deleteGovernment', () => {
    it('should check existence before deleting', async () => {
      repo.find.mockResolvedValue(null);

      await expect(service.deleteGovernment({ id: 'nope' })).rejects.toThrow(
        'Government not found'
      );
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCitiesByGovernment', () => {
    it('should validate government exists before listing cities', async () => {
      repo.find.mockResolvedValue(null);

      await expect(
        service.getCitiesByGovernment({
          governmentId: 'nope',
          filter: {},
        })
      ).rejects.toThrow('Government not found');
    });

    it('should merge governmentId into the filter', async () => {
      repo.find.mockResolvedValue(makeGovernment());
      repo.findCities.mockResolvedValue({
        cities: [],
        page: 1,
        limit: 20,
        count: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });

      await service.getCitiesByGovernment({
        governmentId: 'gov-1',
        filter: { name: 'Maadi' },
      });

      expect(repo.findCities).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            governmentId: 'gov-1',
            name: 'Maadi',
          }),
        })
      );
    });
  });
});

describe('SpecializationService', () => {
  let service: SpecializationService;
  let repo: ReturnType<typeof createMockSpecializationRepository>;

  beforeEach(() => {
    repo = createMockSpecializationRepository();
    service = new SpecializationService({ specializationRepository: repo });
  });

  describe('getSubSpecializations', () => {
    it('should validate parent specialization exists', async () => {
      repo.find.mockResolvedValue(null);

      await expect(service.getSubSpecializations({ parentId: 'nope' })).rejects.toThrow(
        'Specialization not found'
      );
    });

    it('should inject mainSpecializationId into filter', async () => {
      repo.find.mockResolvedValue(makeSpecialization());
      repo.findSubSpecializations.mockResolvedValue({
        subSpecializations: [],
        page: 1,
        limit: 20,
        count: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });

      await service.getSubSpecializations({ parentId: 'spec-1', filter: {} });

      expect(repo.findSubSpecializations).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({ mainSpecializationId: 'spec-1' }),
        })
      );
    });
  });

  describe('createSubSpecialization', () => {
    it('should reject when parent does not exist', async () => {
      repo.find.mockResolvedValue(null);

      await expect(
        service.createSubSpecialization({
          parentId: 'nope',
          input: { name: 'Wiring', nameAr: 'توصيلات' },
        })
      ).rejects.toThrow('Parent specialization not found');
    });
  });

  describe('deleteSubSpecialization', () => {
    it('should reject when sub-specialization does not exist', async () => {
      repo.findSubSpecialization.mockResolvedValue(null);

      await expect(
        service.deleteSubSpecialization({ parentId: 'spec-1', subId: 'nope' })
      ).rejects.toThrow('Sub-specialization not found');
    });
  });

  describe('updateSpecialization', () => {
    it('should merge partial input with existing data', async () => {
      const existing = makeSpecialization({
        name: 'Electricity',
        nameAr: 'كهرباء',
        category: 'ELECTRICITY',
      });
      repo.find.mockResolvedValue(existing);
      repo.update.mockResolvedValue({ ...existing, name: 'Updated' });

      await service.updateSpecialization({
        id: 'spec-1',
        input: { name: 'Updated' },
      });

      // nameAr and category should be preserved from existing
      expect(repo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          specialization: expect.objectContaining({
            name: 'Updated',
            nameAr: 'كهرباء',
            category: 'ELECTRICITY',
          }),
        })
      );
    });
  });
});
