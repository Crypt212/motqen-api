import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import prisma from '../../src/libs/database.js';
import redisClient from '../../src/libs/redis.js';
import {
  authService,
  userRepository,
  clientProfileRepository,
  workerProfileRepository,
} from '../../src/state.js';

vi.mock('../../src/providers/cloudinaryProvider.js', () => ({
  default: vi.fn().mockResolvedValue({ url: 'https://cdn.motqen.com/uploaded.jpg' }),
}));

describe('AuthService Integration Tests (Real DB & Transactions)', () => {
  let testGovId: string;
  let testCityId: string;
  let testSpecId: string;
  let testSubSpecId: string;

  beforeAll(async () => {
    // Insert temporary lookup data required for the test (Government, City, Specialization)
    const testGov = await prisma.government.create({
      data: {
        name: 'TestIntegrationGov',
        nameAr: 'TestIntegrationGov',
        long: 30,
        lat: 31,
      },
    });
    testGovId = testGov.id;

    const testCity = await prisma.city.create({
      data: {
        name: 'TestIntegrationCity',
        nameAr: 'TestIntegrationCity',
        long: 30,
        lat: 31,
        government: {
          connect: { id: testGovId },
        },
      },
    });
    testCityId = testCity.id;

    const testSpec = await prisma.specialization.create({
      data: {
        name: 'TestIntegrationSpec',
        nameAr: 'TestIntegrationSpec',
        category: 'PLUMBING',
      },
    });
    testSpecId = testSpec.id;

    const testSubSpec = await prisma.subSpecialization.create({
      data: {
        name: 'TestIntegrationSubSpec',
        nameAr: 'TestIntegrationSubSpec',
        mainSpecialization: { connect: { id: testSpecId } },
      },
    });
    testSubSpecId = testSubSpec.id;
    console.log('testGovId', testGovId);
    console.log('testCityId', testCityId);
    console.log('testSpecId', testSpecId);
    console.log('testSubSpecId', testSubSpecId);
  });

  afterAll(async () => {
    // Cleanup the seeded lookup records and associated test users logically using cascade where defined
    await prisma.user.deleteMany({
      where: {
        phoneNumber: { startsWith: '019' }, // Arbitrary prefix for our test users
      },
    });

    await prisma.city.delete({ where: { id: testCityId } });
    await prisma.government.delete({ where: { id: testGovId } });
    await prisma.subSpecialization.delete({ where: { id: testSubSpecId } });
    await prisma.specialization.delete({ where: { id: testSpecId } });

    await prisma.$disconnect();
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

  describe('Client Registration Transaction', () => {
    it('should successfully create User, ClientProfile, and Location in a single transaction (Happy Path)', async () => {
      const payload = {
        firstName: 'John',
        middleName: 'M',
        lastName: 'Doe',
        phoneNumber: '01911111111',
        profileImageBuffer: Buffer.from('fake-image-bytes'),
        location: {
          governmentId: testGovId,
          cityId: testCityId,
          address: 'Test Client Address',
          addressNotes: '',
          long: 30.1,
          lat: 31.2,
        },
      };

      const result = await authService.registerClient(payload, {});

      expect(result.user).toBeDefined();
      expect(result.user.phoneNumber).toBe('01911111111');
      expect(result.profile).toBeDefined();

      // Ensure data actually exists in DB
      const dbUser = await userRepository.find({ filter: { id: result.user.id } });
      expect(dbUser).toBeDefined();
      expect(dbUser?.phoneNumber).toBe('01911111111');

      const dbProfile = await clientProfileRepository.find({ filter: { userId: result.user.id } });
      expect(dbProfile).toBeDefined();
      expect(dbProfile?.userId).toBe(result.user.id);

      const dbLocations = await userRepository.findLocations({
        filter: { userId: result.user.id },
      });
      expect(dbLocations).toHaveLength(1);
      expect(dbLocations[0].address).toBe('Test Client Address');
      expect(dbLocations[0].isMain).toBe(true);
    });

    it('should rollback transaction if required related data (City) is missing (Bad Path)', async () => {
      const payload = {
        firstName: 'Jane',
        middleName: 'M',
        lastName: 'Doe',
        phoneNumber: '01922222222',
        profileImageBuffer: Buffer.from('fake'),
        location: {
          governmentId: testGovId,
          cityId: 'non-existent-city-id',
          address: 'Test Invalid Address',
          addressNotes: '',
          long: 30.1,
          lat: 31.2,
        },
      };

      await expect(authService.registerClient(payload, {})).rejects.toThrow('City not found');

      // Verify the transaction was completely rolled back and user was not partially created
      const dbUser = await userRepository.find({ filter: { phoneNumber: '01922222222' } });
      expect(dbUser).toBeNull();
    });
  });

  describe('Worker Registration Transaction', () => {
    it('should successfully create User, WorkerProfile, Verification, and sub-tables (Happy Path)', async () => {
      const userPayload = {
        firstName: 'Worker',
        middleName: 'A',
        lastName: 'Z',
        phoneNumber: '01933333333',
        profileImageBuffer: Buffer.from('fake-profile'),
        location: {
          governmentId: testGovId,
          cityId: testCityId,
          address: 'Worker Base Address',
          addressNotes: '',
          long: 29.0,
          lat: 30.0,
        },
      };

      const workerPayload = {
        experienceYears: 5,
        isInTeam: true,
        acceptsUrgentJobs: false,
        workGovernmentIds: [testGovId],
        specializationsTree: [{ mainId: testSpecId, subIds: [testSubSpecId] }],
        idImageBuffer: Buffer.from('fake-id'),
        profileWithIdImageBuffer: Buffer.from('fake-id-profile'),
      };

      const result = await authService.registerWorker(userPayload, workerPayload);

      expect(result.user).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(result.verification).toBeDefined();
      expect(result.verification.status).toBe('PENDING');

      // Verify DB persists the worker safely
      const dbWorkerProfile = await workerProfileRepository.find({
        workerFilter: { userId: result.user.id },
      });
      expect(dbWorkerProfile).toBeDefined();
      expect(dbWorkerProfile?.experienceYears).toBe(5);

      const dbLocations = await userRepository.findLocations({
        filter: { userId: result.user.id },
      });
      expect(dbLocations).toHaveLength(1);
    });

    it('should rollback entirely if a database unique constraint fails inside the transaction (Bad Path)', async () => {
      // Using the same phone number as the previous test to trigger a unique constraint violation
      const userPayload = {
        firstName: 'Worker',
        middleName: 'A',
        lastName: 'Z',
        phoneNumber: '01933333333', // Duplicate phone
        profileImageBuffer: Buffer.from('fake-profile'),
        location: {
          governmentId: testGovId,
          cityId: testCityId,
          address: 'Worker Base Address',
          addressNotes: '',
          long: 29.0,
          lat: 30.0,
        },
      };

      const workerPayload = {
        experienceYears: 2,
        isInTeam: false,
        acceptsUrgentJobs: true,
        workGovernmentIds: [testGovId],
        specializationsTree: [{ mainId: testSpecId, subIds: [testSubSpecId] }],
        idImageBuffer: Buffer.from('fake-id'),
        profileWithIdImageBuffer: Buffer.from('fake-id-profile'),
      };

      // Ensure the failure bubbles up (likely Prisma Unique constraint failed)
      await expect(authService.registerWorker(userPayload, workerPayload)).rejects.toThrow();

      // Count the profiles for this phone - should still be 1 (from previous test), NOT incremented due to partial write
      const duplicateCount = await prisma.user.count({ where: { phoneNumber: '01933333333' } });
      expect(duplicateCount).toBe(1);
    });
  });
});
