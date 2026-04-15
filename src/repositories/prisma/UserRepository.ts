import IUserRepository from '../interfaces/UserRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { isEmptyFilter, getEmptyPaginatedResult } from './utils.js';
import {
  User,
  UserCreateInput,
  UserFilter,
  Location,
  LocationCreateInput,
  LocationUpdateInput,
} from '../../domain/user.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { PrismaClient } from '../../generated/prisma/client.js';
import { IDType } from '../interfaces/Repository.js';

export default class UserRepository extends Repository implements IUserRepository {
  constructor(
    prisma: PrismaClient | import('../../generated/prisma/client.js').Prisma.TransactionClient
  ) {
    super(prisma);
  }

  private toDomain(record: User): User {
    return {
      id: record.id,
      phoneNumber: record.phoneNumber,
      firstName: record.firstName,
      middleName: record.middleName,
      lastName: record.lastName,
      profileImageUrl: record.profileImageUrl,
      status: record.status,
      role: record.role,
      isOnline: record.isOnline,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainLocation(record: Location): Location {
    return {
      id: record.id,
      userId: record.userId,
      governmentId: record.governmentId,
      cityId: record.cityId,
      address: record.address,
      addressNotes: record.addressNotes,
      long: record.long,
      lat: record.lat,
      isMain: record.isMain,
    };
  }

  async exists({ filter }: { filter: UserFilter }): Promise<boolean> {
    try {
      if (isEmptyFilter(filter)) return false;
      const count = await this.prismaClient.user.count({
        where: filter,
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'exists');
    }
  }

  async find({
    filter,
  }: {
    filter: UserFilter;
  }): Promise<(User & { isClient: boolean; isWorker: boolean }) | null> {
    try {
      const record = await this.prismaClient.user.findFirst({
        where: filter,
      });
      if (!record) return null;
      const isWorker =
        (await this.prismaClient.workerProfile.count({ where: { userId: record.id } })) > 0;
      const isClient =
        (await this.prismaClient.clientProfile.count({ where: { userId: record.id } })) > 0;
      return { ...this.toDomain(record), isClient, isWorker };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findMany({
    filter,
    pagination,
    sort,
  }: {
    filter: UserFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<User>;
  }): Promise<PaginatedResultMeta & { users: User[] }> {
    try {
      const total = await this.prismaClient.user.count({
        where: filter,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const users = await this.prismaClient.user.findMany({
        where: filter,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        users: users.map((u) => this.toDomain(u)),
        ...paginationResult,
        count: users.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }

  async findOnline({
    filter,
    pagination,
    sort,
  }: {
    filter: UserFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<User>;
  }): Promise<PaginatedResultMeta & { users: User[] }> {
    try {
      const whereCondition = {
        ...filter,
        isOnline: true,
      };

      const total = await this.prismaClient.user.count({
        where: whereCondition,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const users = await this.prismaClient.user.findMany({
        where: whereCondition,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        users: users.map((u) => this.toDomain(u)),
        ...paginationResult,
        count: users.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findOnline');
    }
  }

  async create({ user }: { user: UserCreateInput }): Promise<User> {
    try {
      const record = await this.prismaClient.user.create({
        data: user,
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async update({ filter, user }: { filter: UserFilter; user: Partial<User> }): Promise<User> {
    try {
      if (isEmptyFilter(filter)) {
        throw new Error('User not found');
      }
      const existingUser = await this.prismaClient.user.findFirst({
        where: filter,
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      const updated = await this.prismaClient.user.update({
        where: { id: existingUser.id },
        data: user,
      });
      return this.toDomain(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async delete({ filter }: { filter: UserFilter }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;
      const existingUser = await this.prismaClient.user.findFirst({
        where: filter,
      });

      if (!existingUser) return;

      await this.prismaClient.user.delete({
        where: { id: existingUser.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }

  // ─── Location methods ──────────────────────────────────────────────────

  async findWithPrimaryLocation(params: {
    filter: UserFilter;
  }): Promise<(User & { location: Location }) | null> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return null;

      const user = await this.prismaClient.user.findFirst({
        where: filter,
      });

      if (!user) return null;

      const locations = await this.prismaClient.$queryRaw<Location[]>`
        SELECT id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain",
               ST_X("pointGeography"::geometry) as long, ST_Y("pointGeography"::geometry) as lat
        FROM locations
        WHERE "userId" = ${user.id} AND "isMain" = true
        LIMIT 1
      `;

      if (!locations || locations.length === 0) return null;

      return {
        ...this.toDomain(user),
        location: this.toDomainLocation(locations[0]),
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findWithPrimaryLocation');
    }
  }

  async addLocation(params: { userId: IDType; location: LocationCreateInput }): Promise<Location> {
    try {
      if (params.location.isMain) {
        await this.prismaClient.location.updateMany({
          where: { userId: params.userId },
          data: { isMain: false },
        });
      }

      const { governmentId, cityId, address, addressNotes, long, lat, isMain } = params.location;

      const records = await this.prismaClient.$queryRaw<Location[]>`
        INSERT INTO locations (id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain", "pointGeography")
        VALUES (gen_random_uuid(), ${params.userId}, ${governmentId}, ${cityId}, ${address}, ${addressNotes}, ${isMain}, ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326))
        RETURNING id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain", ST_X("pointGeography"::geometry) as long, ST_Y("pointGeography"::geometry) as lat
      `;

      return this.toDomainLocation(records[0]);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'addLocation');
    }
  }

  async updatePrimaryLocation(params: {
    userId: IDType;
    location: LocationUpdateInput;
  }): Promise<Location> {
    try {
      const mainLocations = await this.prismaClient.$queryRaw<Location[]>`
        SELECT id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain",
               ST_X("pointGeography"::geometry) as long, ST_Y("pointGeography"::geometry) as lat
        FROM locations
        WHERE "userId" = ${params.userId} AND "isMain" = true
        LIMIT 1
      `;

      if (!mainLocations || mainLocations.length === 0) {
        throw new Error('Primary location not found');
      }
      const mainLocation = mainLocations[0];

      // If this explicitly tries to switch main toggle, we handle it
      if (params.location.isMain) {
        await this.prismaClient.location.updateMany({
          where: { userId: params.userId, id: { not: mainLocation.id } },
          data: { isMain: false },
        });
      }

      const { governmentId, cityId, address, addressNotes, long, lat, isMain } = params.location;
      const updated = await this.prismaClient.$queryRaw<Location[]>`
        UPDATE locations
        SET 
          "governmentId" = COALESCE(${governmentId}, "governmentId"),
          "cityId" = COALESCE(${cityId}, "cityId"),
          address = COALESCE(${address}, address),
          "addressNotes" = COALESCE(${addressNotes}, "addressNotes"),
          "isMain" = COALESCE(${isMain}, "isMain"),
          "pointGeography" = CASE 
            WHEN ${long} IS NOT NULL AND ${lat} IS NOT NULL 
            THEN ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)
            ELSE "pointGeography" 
          END,
          "updatedAt" = NOW()
        WHERE id = ${mainLocation.id} AND "userId" = ${params.userId}
        RETURNING id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain",
                  ST_X("pointGeography"::geometry) as long, ST_Y("pointGeography"::geometry) as lat
      `;
      return this.toDomainLocation(updated[0]);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updatePrimaryLocation');
    }
  }

  async findLocations(params: { filter: { userId: IDType } }): Promise<Location[]> {
    try {
      const locations = await this.prismaClient.$queryRaw<Location[]>`
        SELECT id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain",
               ST_X("pointGeography"::geometry) as long, ST_Y("pointGeography"::geometry) as lat
        FROM locations
        WHERE "userId" = ${params.filter.userId}
      `;
      return locations.map((l) => this.toDomainLocation(l));
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findLocations');
    }
  }

  async updateLocation(params: {
    filter: { id: IDType; userId: IDType };
    location: LocationUpdateInput;
  }): Promise<Location> {
    try {
      if (params.location.isMain) {
        await this.prismaClient.location.updateMany({
          where: { userId: params.filter.userId, id: { not: params.filter.id } },
          data: { isMain: false },
        });
      }

      const { governmentId, cityId, address, addressNotes, long, lat, isMain } = params.location;
      const updated = await this.prismaClient.$queryRaw<Location[]>`
        UPDATE locations
        SET 
          "cityId" = COALESCE(${cityId}, "cityId"),
          address = COALESCE(${address}, address),
          "addressNotes" = COALESCE(${addressNotes}, "addressNotes"),
          "pointGeography" = CASE 
            WHEN ${long} IS NOT NULL AND ${lat} IS NOT NULL 
            THEN ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)
            ELSE "pointGeography" 
          END,
          "updatedAt" = NOW()
        WHERE id = ${params.filter.id} AND "userId" = ${params.filter.userId}
        RETURNING id, "userId", "governmentId", "cityId", address, "addressNotes", "isMain",
                  ST_X("pointGeography"::geometry) as long, ST_Y("pointGeography"::geometry) as lat
      `;
      return this.toDomainLocation(updated[0]);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateLocation');
    }
  }

  async deleteLocation(params: { filter: { id: IDType; userId: IDType } }): Promise<void> {
    try {
      await this.prismaClient.location.delete({
        where: { id: params.filter.id, userId: params.filter.userId },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteLocation');
    }
  }
}
