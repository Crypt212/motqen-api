import ISpecializationRepository from '../interfaces/SpecializationRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { isEmptyFilter } from './utils.js';
import { PaginationOptions, SortOptions } from '../../types/query.js';
import {
  Specialization,
  SpecializationCreateInput,
  SpecializationFilter,
  SubSpecialization,
  SubSpecializationCreateInput,
  SubSpecializationFilter,
} from '../../domain/specialization.entity.js';
import { PaginatedResultMeta } from '../../types/query.js';
import { PrismaClient } from 'src/generated/prisma/client.js';

export default class SpecializationRepository
  extends Repository
  implements ISpecializationRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  private toDomain(record: Specialization): Specialization {
    return {
      id: record.id,
      name: record.name,
      nameAr: record.nameAr,
      category: record.category,
      updatedAt: record.updatedAt,
      createdAt: record.createdAt,
    };
  }

  private toDomainSub(record: SubSpecialization): SubSpecialization {
    return {
      id: record.id,
      mainSpecializationId: record.mainSpecializationId,
      name: record.name,
      nameAr: record.nameAr,
      updatedAt: record.updatedAt,
      createdAt: record.createdAt,
    };
  }

  async find(params: { filter: SpecializationFilter }): Promise<Specialization | null> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return null;

      const record = await this.prismaClient.specialization.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findMany(params: {
    filter: SpecializationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Specialization>;
  }): Promise<PaginatedResultMeta & { specializations: Specialization[] }> {
    try {
      const { filter, pagination, sort } = params;
      const total = await this.prismaClient.specialization.count({
        where: filter,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const specializations = await this.prismaClient.specialization.findMany({
        where: filter,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        specializations: specializations.map((s) => this.toDomain(s)),
        ...paginationResult,
        count: specializations.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findMany');
    }
  }

  async findSubSpecialization(params: {
    filter: SubSpecializationFilter;
  }): Promise<SubSpecialization | null> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return null;

      const record = await this.prismaClient.subSpecialization.findFirst({
        where: filter,
      });
      return record ? this.toDomainSub(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findSubSpecialization');
    }
  }

  async findSubSpecializations(params: {
    filter: SubSpecializationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<SubSpecialization>;
  }): Promise<PaginatedResultMeta & { subSpecializations: SubSpecialization[] }> {
    try {
      const { filter, pagination, sort } = params;
      const total = await this.prismaClient.subSpecialization.count({
        where: filter,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const subSpecializations = await this.prismaClient.subSpecialization.findMany({
        where: filter,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        subSpecializations: subSpecializations.map((s) => this.toDomainSub(s)),
        ...paginationResult,
        count: subSpecializations.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findSubSpecializations');
    }
  }

  async create(params: { specialization: SpecializationCreateInput }): Promise<Specialization> {
    try {
      const record = await this.prismaClient.specialization.create({
        data: params.specialization,
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async createSubSpecialization(params: {
    mainSpecializationId: IDType;
    subSpecialization: SubSpecializationCreateInput;
  }): Promise<Specialization> {
    try {
      const record = await this.prismaClient.subSpecialization.create({
        data: {
          ...params.subSpecialization,
          mainSpecialization: { connect: { id: params.mainSpecializationId } },
        },
      });
      return this.toDomain({
        id: record.mainSpecializationId,
        name: '',
        nameAr: '',
        category: 'DEFAULTCATEGORY',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      } as Specialization);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'createSubSpecialization');
    }
  }

  async update(params: {
    filter: SpecializationFilter;
    specialization: Specialization;
  }): Promise<Specialization> {
    try {
      const { filter, specialization } = params;
      if (isEmptyFilter(filter)) {
        throw new Error('Specialization not found');
      }

      const existing = await this.prismaClient.specialization.findFirst({
        where: filter,
      });

      if (!existing) {
        throw new Error('Specialization not found');
      }

      const updated = await this.prismaClient.specialization.update({
        where: { id: existing.id },
        data: {
          name: specialization.name,
          nameAr: specialization.nameAr,
          category: specialization.category,
        },
      });
      return this.toDomain(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async updateSubSpecialization(params: {
    filter: SubSpecializationFilter;
    subSpecialization: SubSpecialization;
  }): Promise<SubSpecialization> {
    try {
      const { filter, subSpecialization } = params;
      if (isEmptyFilter(filter)) {
        throw new Error('SubSpecialization not found');
      }

      const existing = await this.prismaClient.subSpecialization.findFirst({
        where: filter,
      });

      if (!existing) {
        throw new Error('SubSpecialization not found');
      }

      const updated = await this.prismaClient.subSpecialization.update({
        where: { id: existing.id },
        data: {
          name: subSpecialization.name,
          nameAr: subSpecialization.nameAr,
        },
      });
      return this.toDomainSub(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'updateSubSpecialization');
    }
  }

  async delete(params: { filter: SpecializationFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      const existing = await this.prismaClient.specialization.findFirst({
        where: filter,
      });

      if (!existing) return;

      await this.prismaClient.specialization.delete({
        where: { id: existing.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }

  async deleteSubSpecialization(params: { filter: SubSpecializationFilter }): Promise<void> {
    try {
      const { filter } = params;
      if (isEmptyFilter(filter)) return;

      const existing = await this.prismaClient.subSpecialization.findFirst({
        where: filter,
      });

      if (!existing) return;

      await this.prismaClient.subSpecialization.delete({
        where: { id: existing.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteSubSpecialization');
    }
  }
}
