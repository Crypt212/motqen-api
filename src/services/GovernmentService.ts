/**
 * @fileoverview Government Service - Handle government operations
 * @module services/GovernmentService
 */

import AppError from '../errors/AppError.js';
import Service, { tryCatch } from './Service.js';
import IGovernmentRepository from '../repositories/interfaces/GovernmentRepository.js';
import {
  Government,
  GovernmentCreateInput,
  GovernmentFilter,
  GovernmentUpdateInput,
  City,
  CityFilter,
} from '../domain/government.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../types/query.js';

export default class GovernmentService extends Service {
  private governmentRepository: IGovernmentRepository;

  constructor(params: { governmentRepository: IGovernmentRepository }) {
    super();
    this.governmentRepository = params.governmentRepository;
  }

  async getGovernments(params: {
    filter: GovernmentFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Government>;
  }): Promise<PaginatedResult<Government>> {
    return tryCatch(async () => {
      return await this.governmentRepository.findMany(params);
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

  async createGovernment(params: {
    data: GovernmentCreateInput;
  }): Promise<Government> {
    return tryCatch(async () => {
      const government = await this.governmentRepository.create({
        government: params.data,
      });
      if (!government) {
        throw new AppError('Failed to create government', 500);
      }
      return government;
    });
  }

  async updateGovernment(params: {
    id: string;
    data: GovernmentUpdateInput;
  }): Promise<Government> {
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
    });
  }

  async getCitiesByGovernment(params: {
    governmentId: string;
    filter: CityFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<City>;
  }): Promise<PaginatedResult<City>> {
    return tryCatch(async () => {
      const existing = await this.governmentRepository.find({
        filter: { id: params.governmentId },
      });
      if (!existing) {
        throw new AppError('Government not found', 404);
      }

      const finalFilter = {
        governmentId: params.governmentId,
        ...params.filter,
      };
      return await this.governmentRepository.findCities({
        filter: finalFilter,
        pagination: params.pagination,
        sort: params.sort,
      });
    });
  }
}
