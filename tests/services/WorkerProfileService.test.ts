import { beforeEach, describe, expect, it } from 'vitest';
import WorkerProfileService from '../../src/services/WorkerProfileService.js';
import { createMockUserRepository, createMockWorkerProfileRepository } from '../helpers/mocks.js';

describe('WorkerProfileService', () => {
  let service: WorkerProfileService;
  let workerRepo: ReturnType<typeof createMockWorkerProfileRepository>;

  beforeEach(() => {
    workerRepo = createMockWorkerProfileRepository();
    service = new WorkerProfileService({
      workerProfileRepository: workerRepo,
      userRepository: createMockUserRepository(),
    });
  });

  describe('getMyWorkingHours', () => {
    it('returns empty array when worker has no schedule', async () => {
      workerRepo.findWorkingHoursByUserId.mockResolvedValue(null);

      const result = await service.getMyWorkingHours({ userId: 'user-1' });

      expect(result).toEqual([]);
      expect(workerRepo.findWorkingHoursByUserId).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('maps db entity to WorkingHoursDTO array', async () => {
      workerRepo.findWorkingHoursByUserId.mockResolvedValue({
        id: 'wh-1',
        workerProfileId: 'wp-1',
        daysOfWeek: ['1', '2', '3'],
        startTime: '09:00',
        endTime: '17:00',
      });

      const result = await service.getMyWorkingHours({ userId: 'user-1' });

      expect(result).toEqual([
        {
          daysOfWeek: [1, 2, 3],
          startTime: '09:00',
          endTime: '17:00',
        },
      ]);
    });
  });
});
