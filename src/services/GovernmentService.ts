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
  CityCreateInput,
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
    const { filter, pagination, sort } = params;
    return tryCatch(async () => {
      const result = await this.governmentRepository.findMany({ filter, pagination, sort });
      return result;
    });
  }

  async getGovernmentById(params: { id: string }): Promise<Government> {
    const { id } = params;
    return tryCatch(async () => {
      const government = await this.governmentRepository.find({
        filter: { id },
      });
      if (!government) {
        throw new AppError('Government not found', 404);
      }
      return government;
    });
  }

  async createGovernment(params: { data: GovernmentCreateInput }): Promise<Government> {
    const { data } = params;
    return tryCatch(async () => {
      const government = await this.governmentRepository.create({
        government: data,
      });
      if (!government) {
        throw new AppError('Failed to create government', 500);
      }
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
      return government;
    });
  }

  async updateGovernment(params: { id: string; data: GovernmentUpdateInput }): Promise<Government> {
    const { id, data } = params;
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }

      const government = await this.governmentRepository.update({
        filter: { id },
        data
      });
      if (!government) {
        throw new AppError('Failed to update government', 500);
      }
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
      return government;
    });
  }

  async deleteGovernment(params: { id: string }): Promise<void> {
    const { id } = params;
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }
      await this.governmentRepository.delete({ filter: { id } });
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
    });
  }

  async getCitiesByGovernment(params: {
    governmentId: string;
    cityFilter: CityFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<City>;
  }): Promise<PaginatedResultMeta & { cities: City[] }> {
    const { governmentId, cityFilter: filter, pagination, sort } = params;
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id: governmentId },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }

      const finalFilter = {
        governmentId,
        ...filter,
      };
      const result = await this.governmentRepository.findCities({
        filter: finalFilter,
        pagination,
        sort,
      });
      return result;
    });
  }

  async getCityById(params: { id: string }): Promise<City> {
    const { id } = params;
    return tryCatch(async () => {
      const city = await this.governmentRepository.findCity({
        filter: { id },
      });
      if (!city) {
        throw new AppError('City not found', 404);
      }
      return city;
    });
  }

  async createCity(params: { governmentId: string; data: CityCreateInput }): Promise<City> {
    const { governmentId, data } = params;
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id: governmentId },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }

      const city = await this.governmentRepository.createCity({
        governmentId,
        city: data,
      });
      if (!city) {
        throw new AppError('Failed to create city', 500);
      }
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
      return city;
    });
  }

  async updateCity(params: { id: string; data: Partial<CityCreateInput> }): Promise<City> {
    const { id, data } = params;
    return tryCatch(async () => {
      const existing = await this.governmentRepository.findCity({
        filter: { id },
      });
      if (!existing) {
        throw new AppError('City not found', 404);
      }

      const city = await this.governmentRepository.updateCity({
        filter: { id },
        data
      });
      if (!city) {
        throw new AppError('Failed to update city', 500);
      }
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
      return city;
    });
  }

  async deleteCity(params: { id: string }): Promise<void> {
    const { id } = params;
    return tryCatch(async () => {
      const existing = await this.governmentRepository.findCity({
        filter: { id },
      });
      if (!existing) {
        throw new AppError('City not found', 404);
      }
      await this.governmentRepository.deleteCity({ filter: { id } });
      if (this.dataCache) await this.dataCache.delPattern('data:govs:*');
    });
  }
}
