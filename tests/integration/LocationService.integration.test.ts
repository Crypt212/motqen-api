import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../src/libs/database.js';
import { locationService } from '../../src/state.js';

describe('LocationService Integration Tests (Real DB & Transactions)', () => {
  let testGovId: string;
  let testCityId: string;
  let testUserId: string;
  let firstLocationId: string;

  beforeAll(async () => {
    // 1. Create a User to own the locations
    const testUser = await prisma.user.create({
      data: {
        phoneNumber: '01988888888',
        firstName: 'TestLoc',
        middleName: 'M',
        lastName: 'User',
      },
    });
    testUserId = testUser.id;

    // 2. Create Government and City
    const testGov = await prisma.government.create({
      data: {
        name: 'TestLocGov',
        nameAr: 'TestLocGov',
        long: 30,
        lat: 31,
      },
    });
    testGovId = testGov.id;

    const testCity = await prisma.city.create({
      data: {
        name: 'TestLocCity',
        nameAr: 'TestLocCity',
        long: 30,
        lat: 31,
        government: {
          connect: { id: testGovId },
        },
      },
    });
    testCityId = testCity.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.city.delete({ where: { id: testCityId } });
    await prisma.government.delete({ where: { id: testGovId } });
    await prisma.$disconnect();
  });

  describe('Location CRUD and Atomicity', () => {
    it('should create a first main location', async () => {
      const payload = {
        governmentId: testGovId,
        cityId: testCityId,
        address: '1st Ave',
        long: 30.1,
        lat: 31.2,
        isMain: true,
      };

      const result = await locationService.createLocation({ userId: testUserId, data: payload });
      console.log(result);

      expect(result.id).toBeDefined();
      expect(result.isMain).toBe(true);
      expect(result.address).toBe('1st Ave');

      firstLocationId = result.id;
    });

    it('should create a second main location and atomically un-main the first', async () => {
      const payload = {
        governmentId: testGovId,
        cityId: testCityId,
        address: '12 Magles Al Madena, Shubra El Kheima 1, Al-Qalyubia Governorate',
        long: 30.2,
        lat: 31.3,
        isMain: true,
      };

      const secondResult = await locationService.createLocation({
        userId: testUserId,
        data: payload,
      });

      expect(secondResult.isMain).toBe(true);
      expect(secondResult.address).toBe(
        '12 Magles Al Madena, Shubra El Kheima 1, Al-Qalyubia Governorate'
      );

      // Check first location
      const firstLoc = await locationService.getLocationById({
        userId: testUserId,
        locationId: firstLocationId,
      });
      expect(firstLoc.isMain).toBe(false); // It should have been atomically updated
    });

    it('should retrieve list of locations with coordinates correctly mapped', async () => {
      const result = await locationService.getLocations({ userId: testUserId, filter: {} });

      expect(result.locations.length).toBe(2);
      // Ensure raw SQL query mapped lat/long correctly
      expect(result.locations[0].long).toBeDefined();
      expect(result.locations[0].lat).toBeDefined();
    });

    it('should delete the main location and promote the other to main', async () => {
      // Find the current main
      const result = await locationService.getLocations({ userId: testUserId, filter: {} });
      const currentMain = result.locations.find((l) => l.isMain)!;
      const otherLocation = result.locations.find((l) => !l.isMain)!;

      // Delete the main
      await locationService.deleteLocation({ userId: testUserId, locationId: currentMain.id });

      // Verify the other location was promoted
      const promotedLoc = await locationService.getLocationById({
        userId: testUserId,
        locationId: otherLocation.id,
      });
      expect(promotedLoc.isMain).toBe(true);
    });
  });
});
