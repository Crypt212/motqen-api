/**
 * ClientProfileService & UserService Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientService from '../../src/services/ClientProfileService.js';
import UserService from '../../src/services/UserService.js';
import {
  createMockUserRepository,
  createMockClientProfileRepository,
  createMockWorkerProfileRepository,
  makeUser,
  makeClientProfile,
  makeWorkerProfile,
} from '../helpers/mocks.js';

vi.mock('../../src/providers/cloudinaryProvider.js', () => ({
  default: vi.fn().mockResolvedValue({ url: 'https://cdn.motqen.com/up.jpg' }),
}));

describe('ClientProfileService', () => {
  let service: ClientService;
  let clientRepo: ReturnType<typeof createMockClientProfileRepository>;
  let userRepo: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    clientRepo = createMockClientProfileRepository();
    userRepo = createMockUserRepository();
    service = new ClientService({ clientProfileRepository: clientRepo, userRepository: userRepo });
  });

  describe('get', () => {
    it('should throw 404 when user does not exist', async () => {
      userRepo.find.mockResolvedValue(null);
      await expect(service.get({ userId: 'x' })).rejects.toThrow('User not found');
    });

    it('should throw 404 when user has no client profile', async () => {
      userRepo.find.mockResolvedValue(makeUser());
      clientRepo.find.mockResolvedValue(null);
      await expect(service.get({ userId: 'user-1' })).rejects.toThrow('Client profile not found');
    });

    it('should return profile when both exist', async () => {
      userRepo.find.mockResolvedValue(makeUser());
      clientRepo.find.mockResolvedValue(makeClientProfile());
      const result = await service.get({ userId: 'user-1' });
      expect(result).toEqual(makeClientProfile());
    });
  });

  describe('create', () => {
    it('should validate user exists before creating profile', async () => {
      userRepo.find.mockResolvedValue(null);
      await expect(
        service.create({
          userId: 'x',
          data: { location: { governmentId: 'g', cityId: 'c', address: 'A', isMain: true } },
        })
      ).rejects.toThrow('User not found');
    });

    it('should create client profile and force isMain=true on new primary location on User', async () => {
      userRepo.find.mockResolvedValue(makeUser());
      clientRepo.create.mockResolvedValue(makeClientProfile());
      userRepo.addLocation.mockResolvedValue({});

      await service.create({
        userId: 'user-1',
        data: { location: { governmentId: 'g', cityId: 'c', address: 'A', isMain: false } },
      });

      expect(clientRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        clientProfile: {},
      });
      expect(userRepo.addLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          location: expect.objectContaining({ isMain: true }),
        })
      );
    });
  });
});

describe('UserService', () => {
  let service: UserService;
  let userRepo: ReturnType<typeof createMockUserRepository>;
  let workerRepo: ReturnType<typeof createMockWorkerProfileRepository>;
  let clientRepo: ReturnType<typeof createMockClientProfileRepository>;

  beforeEach(() => {
    userRepo = createMockUserRepository();
    workerRepo = createMockWorkerProfileRepository();
    clientRepo = createMockClientProfileRepository();
    service = new UserService({
      userRepository: userRepo,
      workerProfileRepository: workerRepo,
      clientProfileRepository: clientRepo,
    });
  });

  describe('getStatus', () => {
    it('should return worker + verification info', async () => {
      userRepo.find.mockResolvedValue(makeUser());
      workerRepo.find.mockResolvedValue(makeWorkerProfile({ id: 'wp-1' }));
      workerRepo.findVerification.mockResolvedValue({ status: 'APPROVED', reason: 'OK' });
      clientRepo.find.mockResolvedValue(null);
      const state = await service.getStatus({ filter: { id: 'user-1' } });
      expect(state.worker!.verification.status).toBe('APPROVED');
      expect(state.client).toBeUndefined();
    });

    it('should return client info when user has client profile', async () => {
      userRepo.find.mockResolvedValue(makeUser());
      workerRepo.find.mockResolvedValue(null);
      clientRepo.find.mockResolvedValue(makeClientProfile({ id: 'cp-1' }));
      const state = await service.getStatus({ filter: { id: 'user-1' } });
      expect(state.client!.id).toBe('cp-1');
      expect(state.worker).toBeUndefined();
    });
  });
});
