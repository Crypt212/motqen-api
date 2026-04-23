import ILocationRepository from '../repositories/interfaces/LocationRepository.js';
import IGovernmentRepository from '../repositories/interfaces/GovernmentRepository.js';
import { TransactionManager } from '../repositories/prisma/TransactionManager.js';
import Service, { tryCatch } from './Service.js';
import AppError from '../errors/AppError.js';
import { Location, LocationFilter } from '../domain/location.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../types/query.js';
import LocationRepository from '../repositories/prisma/LocationRepository.js';

export default class LocationService extends Service {
  private locationRepository: ILocationRepository;
  private governmentRepository: IGovernmentRepository;
  private transactionManager: TransactionManager;

  constructor(params: {
    locationRepository: ILocationRepository;
    governmentRepository: IGovernmentRepository;
    transactionManager: TransactionManager;
  }) {
    super();
    this.locationRepository = params.locationRepository;
    this.governmentRepository = params.governmentRepository;
    this.transactionManager = params.transactionManager;
  }

  async getLocations(params: {
    userId: string;
    filter: LocationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Location>;
  }): Promise<PaginatedResultMeta & { locations: Location[] }> {
    return tryCatch(async () => {
      return await this.locationRepository.findMany({
        filter: { ...params.filter, userId: params.userId },
        pagination: params.pagination,
        sort: params.sort,
      });
    });
  }

  async createLocation(params: {
    userId: string;
    data: import('../schemas/location.js').CreateLocationDTO;
  }): Promise<Location> {
    return tryCatch(async () => {
      const { userId, data } = params;

      // 1. Validate government exists
      const government = await this.governmentRepository.find({
        filter: { id: data.governmentId },
      });
      if (!government) {
        throw new AppError(`Government with ID ${data.governmentId} not found`, 400);
      }

      // 2. Validate city exists and belongs to the government
      const city = await this.governmentRepository.findCity({
        filter: { id: data.cityId, governmentId: data.governmentId },
      });
      if (!city) {
        throw new AppError(
          `City with ID ${data.cityId} not found in government ${data.governmentId}`,
          400
        );
      }

      // 3. Handle main location atomic switch
      if (data.isMain) {
        return await this.transactionManager.execute(
          { locationRepo: LocationRepository },
          async ({ locationRepo }) => {
            // Acquire advisory lock to prevent race conditions on "main" status per user
            await locationRepo.prismaClient.$queryRaw<
              { locked: boolean }[]
            >`SELECT pg_try_advisory_xact_lock(hashtext(${userId})) as locked`;

            // Un-set existing main locations
            await locationRepo.setAllNonMain({ userId });

            // Create new main location
            return await locationRepo.create({
              location: { ...data, userId },
            });
          }
        );
      }

      // 4. Just create if not main
      return await this.locationRepository.create({
        location: { ...data, userId },
      });
    });
  }

  async getMainLocation(params: { userId: string }): Promise<Location> {
    return tryCatch(async () => {
      const location = await this.locationRepository.find({
        filter: { userId: params.userId, isMain: true },
      });
      if (!location) throw new AppError('No main location set', 404);
      return location;
    });
  }

  async updateLocation(params: {
    userId: string;
    locationId: string;
    data: import('../schemas/location.js').UpdateLocationDTO;
  }): Promise<Location> {
    return tryCatch(async () => {
      const { userId, locationId, data } = params;

      // 1. Find and check existence
      const location = await this.locationRepository.find({ filter: { id: locationId } });
      if (!location) throw new AppError('Location not found', 404);

      // 2. Check ownership
      if (location.userId !== userId) throw new AppError('Forbidden', 403);

      // 3. Validate government/city if provided
      if (data.governmentId) {
        const government = await this.governmentRepository.find({
          filter: { id: data.governmentId },
        });
        if (!government)
          throw new AppError(`Government with ID ${data.governmentId} not found`, 400);

        if (data.cityId) {
          const city = await this.governmentRepository.findCity({
            filter: { id: data.cityId, governmentId: data.governmentId },
          });
          if (!city)
            throw new AppError(
              `City with ID ${data.cityId} not found in government ${data.governmentId}`,
              400
            );
        }
      } else if (data.cityId) {
        // City provided without government, validate against existing location's government
        const city = await this.governmentRepository.findCity({
          filter: { id: data.cityId, governmentId: location.government.id },
        });
        if (!city)
          throw new AppError(
            `City with ID ${data.cityId} not found in government ${location.government.id}`,
            400
          );
      }

      // 4. Handle main location atomic switch
      if (data.isMain === true) {
        return await this.transactionManager.execute(
          { locationRepo: LocationRepository },
          async ({ locationRepo }) => {
            await locationRepo.prismaClient
              .$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

            await locationRepo.setAllNonMain({ userId });

            return await locationRepo.update({
              filter: { id: locationId },
              location: data,
            });
          }
        );
      }

      // 5. Standard update
      return await this.locationRepository.update({
        filter: { id: locationId },
        location: data,
      });
    });
  }

  async updateMainLocation(params: {
    userId: string;
    data: import('../schemas/location.js').UpdateLocationDTO;
  }): Promise<Location> {
    return tryCatch(async () => {
      const { userId, data } = params;
      const mainLocation = await this.locationRepository.find({ filter: { userId, isMain: true } });
      if (!mainLocation) throw new AppError('No main location set', 404);
      return await this.updateLocation({ userId, locationId: mainLocation.id, data });
    });
  }

  async getLocationById(params: { userId: string; locationId: string }): Promise<Location> {
    return tryCatch(async () => {
      const { userId, locationId } = params;
      const location = await this.locationRepository.find({ filter: { id: locationId } });
      if (!location) throw new AppError('Location not found', 404);
      if (location.userId !== userId) throw new AppError('Forbidden', 403);
      return location;
    });
  }
}
