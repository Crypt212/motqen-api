/**
 * @fileoverview Government Service - Handle government operations
 * @module services/GovernmentService
 */

import AppError from '../errors/AppError.js';
import Service, { tryCatch } from './Service.js';
import IGovernmentRepository from '../repositories/interfaces/GovernmentRepository.js';
import IDataCache from '../cache/interfaces/DataCache.js';
import {
  Government,
  GovernmentCreateInput,
  GovernmentFilter,
  GovernmentUpdateInput,
  City,
  CityFilter,
} from '../domain/government.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../types/query.js';

export default class GovernmentService extends Service {
  private governmentRepository: IGovernmentRepository;
  private dataCache?: IDataCache;

  constructor(params: { governmentRepository: IGovernmentRepository, dataCache?: IDataCache }) {
    super();
    this.governmentRepository = params.governmentRepository;
    this.dataCache = params.dataCache;
  }

  async getGovernments(params: {
    filter: GovernmentFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Government>;
  }): Promise<PaginatedResultMeta & { governments: Government[] }> {
    return tryCatch(async () => {
      const cacheKey = 'data:govs:all';
      if (this.dataCache) {
        const cached = await this.dataCache.get<PaginatedResultMeta & { governments: Government[] }>(cacheKey);
        if (cached) return cached;
      }
      const result = await this.governmentRepository.findMany(params);
      if (this.dataCache) {
        await this.dataCache.set(cacheKey, result, 86400);
      }
      return result;
    });
  }

  async getGovernmentById(params: { id: string }): Promise<Government> {
    return tryCatch(async () => {
      const government = await this.governmentRepository.find({
        filter: { id: params.id },
      });
      if (!government) {
        throw new AppError('Government not found', 404);
      }
      return government;
    });
  }

  async createGovernment(params: { data: GovernmentCreateInput }): Promise<Government> {
    return tryCatch(async () => {
      const government = await this.governmentRepository.create({
        government: params.data,
      });
      if (!government) {
        throw new AppError('Failed to create government', 500);
      }
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
      return government;
    });
  }

  async updateGovernment(params: { id: string; data: GovernmentUpdateInput }): Promise<Government> {
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id: params.id },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }

      const government = await this.governmentRepository.update({
        filter: { id: params.id },
        data: params.data,
      });
      if (!government) {
        throw new AppError('Failed to update government', 500);
      }
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
      return government;
    });
  }

  async deleteGovernment(params: { id: string }): Promise<void> {
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id: params.id },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }
      await this.governmentRepository.delete({ filter: { id: params.id } });
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
    });
  }

  async getCitiesByGovernment(params: {
    governmentId: string;
    filter: CityFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<City>;
  }): Promise<PaginatedResultMeta & { cities: City[] }> {
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id: params.governmentId },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }

      const cacheKey = `data:govs:${params.governmentId}:cities`;
      if (this.dataCache) {
        const cached = await this.dataCache.get<PaginatedResultMeta & { cities: City[] }>(cacheKey);
        if (cached) return cached;
      }

      const finalFilter = {
        governmentId: params.governmentId,
        ...params.filter,
      };
      const result = await this.governmentRepository.findCities({
        filter: finalFilter,
        pagination: params.pagination,
        sort: params.sort,
      });

      if (this.dataCache) {
        await this.dataCache.set(cacheKey, result, 86400);
      }
      return result;
    });
  }
}
