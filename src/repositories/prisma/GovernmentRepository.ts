import IGovernmentRepository from '../interfaces/GovernmentRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  Government,
  GovernmentCreateInput,
  GovernmentFilter,
  GovernmentUpdateInput,
  City,
  CityFilter,
} from '../../domain/government.entity.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { isEmptyFilter } from './utils.js';
import { PaginationOptions, SortOptions, PaginatedResultMeta } from '../../types/query.js';
import { PrismaClient } from '../../generated/prisma/client.js';

export default class GovernmentRepository extends Repository implements IGovernmentRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: Government): Government {
    return {
      id: record.id,
      name: record.name,
      nameAr: record.nameAr,
      long: record.long,
      lat: record.lat,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainCity(record: City): City {
    return {
      id: record.id,
      governmentId: record.governmentId,
      name: record.name,
      nameAr: record.nameAr,
      long: record.long,
      lat: record.lat,
      updatedAt: record.updatedAt,
      createdAt: record.createdAt,
    };
  }

  async find(params: { filter: GovernmentFilter }): Promise<Government | null> {
    try {
      const { filter } = params;

      const record = await this.prismaClient.government.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findMany(params: {
    filter: GovernmentFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Government>;
  }): Promise<PaginatedResultMeta & { governments: Government[] }> {
    try {
      const { filter, pagination, sort } = params;

      const total = await this.prismaClient.government.count({
        where: filter,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const governments = await this.prismaClient.government.findMany({
        where: filter,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        governments: governments.map((g) => this.toDomain(g)),
        ...paginationResult,
        count: governments.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }

  async findCity(params: { filter: CityFilter }): Promise<City | null> {
    try {
      const { filter } = params;
      console.log(filter);
      if (isEmptyFilter(filter)) return null;

      const record = await this.prismaClient.city.findFirst({
        where: filter,
      });
      return record ? this.toDomainCity(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findCity');
    }
  }

  async findCities(params: {
    filter: CityFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<City>;
  }): Promise<PaginatedResultMeta & { cities: City[] }> {
    try {
      const { filter, pagination, sort } = params;

      const total = await this.prismaClient.city.count({
        where: filter,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const cities = await this.prismaClient.city.findMany({
        where: filter,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        cities: cities.map((c) => this.toDomainCity(c)),
        ...paginationResult,
        count: cities.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findCities');
    }
  }

  async create(params: { government: GovernmentCreateInput }): Promise<Government> {
    try {
      const record = await this.prismaClient.government.create({
        data: params.government,
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async createCity(params: {
    governmentId: IDType;
    city: Omit<City, 'id' | 'governmentId'>;
  }): Promise<City> {
    try {
      const record = await this.prismaClient.city.create({
        data: {
          ...params.city,
          government: { connect: { id: params.governmentId } },
        },
      });
      return this.toDomainCity(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'createCity');
    }
  }

  async update(params: {
    filter: GovernmentFilter;
    data: GovernmentUpdateInput;
  }): Promise<Government> {
    try {
      const { filter, data } = params;
      if (isEmptyFilter(filter)) {
        throw new Error('Government ID is required for update');
      }

      const existing = await this.prismaClient.government.findFirst({
        where: filter,
      });

      if (!existing) {
        throw new Error('Government not found');
      }

      const updated = await this.prismaClient.government.update({
        where: { id: existing.id },
        data: data,
      });
      return this.toDomain(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async delete(params: { filter: GovernmentFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      const existing = await this.prismaClient.government.findFirst({
        where: filter,
      });

      if (!existing) return;

      await this.prismaClient.government.delete({
        where: { id: existing.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }

  async deleteCity(params: { filter: CityFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      const existing = await this.prismaClient.city.findFirst({
        where: filter,
      });

      if (!existing) return;

      await this.prismaClient.city.delete({
        where: { id: existing.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteCity');
    }
  }
}
