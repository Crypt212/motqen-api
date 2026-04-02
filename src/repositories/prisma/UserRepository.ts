import IUserRepository from '../interfaces/UserRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { isEmptyFilter, getEmptyPaginatedResult } from './utils.js';
import { User, UserCreateInput, UserFilter } from '../../domain/user.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { PrismaClient } from 'src/generated/prisma/client.js';

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
      if (isEmptyFilter(filter)) return null;
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
      if (isEmptyFilter(filter)) return { users: [], ...getEmptyPaginatedResult() };

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
      if (isEmptyFilter(filter)) return { users: [], ...getEmptyPaginatedResult() };

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
}
