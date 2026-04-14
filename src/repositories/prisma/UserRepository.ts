import IUserRepository from '../interfaces/UserRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import {
  getPaginationQuery,
  getPaginationResult,
  handleSort,
  isEmptyFilter,
  paginateResult,
} from '../../utils/handleFilteration.js';
import {
  User,
  UserCreateInput,
  UserFilter,
  Location,
  LocationCreateInput,
  LocationUpdateInput,
} from '../../domain/user.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';
import { PrismaClient } from '../../generated/prisma/client.js';
import { IDType } from '../interfaces/Repository.js';

export default class UserRepository extends Repository implements IUserRepository {
  constructor(prisma: PrismaClient) {
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
  }): Promise<PaginatedResult<{ users: User[] }>> {
    try {
      const sortQuery = handleSort(sort);
      const paginationQuery = getPaginationQuery(pagination);

      const users = await this.prismaClient.user.findMany({
        where: filter,
        take: paginationQuery.take + 1,
        skip: paginationQuery.skip,
        orderBy: sortQuery,
      });

      const paginationResult = getPaginationResult({
        count: users.length,
        hasNext: users.length > paginationQuery.take,
        paginationOptions: pagination,
      });

      return paginateResult(
        { users: users.map((u) => this.toDomain(u)).slice(0, users.length - 1) },
        paginationResult
      );
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
  }): Promise<PaginatedResult<{ users: User[] }>> {
    try {
      const whereCondition = {
        ...filter,
        isOnline: true,
      };

      const sortQuery = handleSort(sort);

      const paginationQuery = getPaginationQuery(pagination);

      const users = await this.prismaClient.user.findMany({
        where: whereCondition,
        take: paginationQuery.take + 1,
        skip: paginationQuery.skip,
        orderBy: sortQuery,
      });

      const paginationResult = getPaginationResult({
        hasNext: users.length > paginationQuery.take,
        count: users.length,
        paginationOptions: pagination,
      });

      return paginateResult(
        { users: users.map((u) => this.toDomain(u)).slice(0, users.length - 1) },
        paginationResult
      );
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

      const userWithLocation = await this.prismaClient.user.findFirst({
        where: filter,
        include: {
          locations: {
            where: { isMain: true },
            take: 1,
          },
        },
      });

      if (!userWithLocation || userWithLocation.locations.length === 0) return null;

      const location = userWithLocation.locations[0];
      return {
        ...this.toDomain(userWithLocation),
        location: this.toDomainLocation(location),
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

      const record = await this.prismaClient.location.create({
        data: {
          userId: params.userId,
          ...params.location,
        },
      });
      return this.toDomainLocation(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'addLocation');
    }
  }

  async updatePrimaryLocation(params: {
    userId: IDType;
    location: LocationUpdateInput;
  }): Promise<Location> {
    try {
      const mainLocation = await this.prismaClient.location.findFirst({
        where: {
          userId: params.userId,
          isMain: true,
        },
      });

      if (!mainLocation) {
        throw new Error('Primary location not found');
      }

      // If this explicitly tries to switch main toggle, we handle it
      if (params.location.isMain) {
        await this.prismaClient.location.updateMany({
          where: { userId: params.userId, id: { not: mainLocation.id } },
          data: { isMain: false },
        });
      }

      const updated = await this.prismaClient.location.update({
        where: { id: mainLocation.id },
        data: params.location,
      });
      return this.toDomainLocation(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updatePrimaryLocation');
    }
  }

  async findLocations(params: {
    filter: { userId: IDType };
    pagination?: PaginationOptions;
  }): Promise<PaginatedResult<{ locations: Location[] }>> {
    try {
      const { filter, pagination } = params;
      const paginationQuery = getPaginationQuery(pagination);

      const locations = await this.prismaClient.location.findMany({
        where: { userId: filter.userId },
        skip: paginationQuery.skip,
        take: paginationQuery.take + 1,
      });

      const paginationResult = getPaginationResult({
        count: locations.length,
        hasNext: locations.length > paginationQuery.take,
        paginationOptions: params.pagination,
      });

      return paginateResult(
        {
          locations: locations.map((l) => this.toDomainLocation(l)).slice(0, locations.length - 1),
        },
        paginationResult
      );
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

      const updated = await this.prismaClient.location.update({
        where: { id: params.filter.id, userId: params.filter.userId },
        data: params.location,
      });
      return this.toDomainLocation(updated);
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
