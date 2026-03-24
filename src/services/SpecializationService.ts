/**
 * @fileoverview Specialization Service - Handle specialization operations
 * @module services/SpecializationService
 */

import Service from './Service.js';
import ISpecializationRepository from '../repositories/interfaces/SpecializationRepository.js';
import {
  Specialization,
  SpecializationFilter,
  SpecializationCategory,
  SubSpecialization,
} from '../domain/specialization.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../types/query.js';
import AppError from '../errors/AppError.js';

export type CreateSpecializationInput = {
  name: string;
  nameAr?: string;
  category?: SpecializationCategory;
};

export type UpdateSpecializationInput = {
  name?: string;
  nameAr?: string;
  category?: SpecializationCategory;
};

export type CreateSubSpecializationInput = {
  name: string;
  nameAr?: string;
};

export default class SpecializationService extends Service {
  private specializationRepository: ISpecializationRepository;

  constructor(params: { specializationRepository: ISpecializationRepository }) {
    super();
    this.specializationRepository = params.specializationRepository;
  }

  async getSpecializations(params: {
    filter?: SpecializationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Specialization>;
  }): Promise<PaginatedResult<Specialization>> {
    const { filter, pagination, sort } = params;
    return await this.specializationRepository.findMany({
      filter: filter || {},
      pagination,
      sort,
    });
  }

  async getSpecializationById(params: { id: string }): Promise<Specialization> {
    const specialization = await this.specializationRepository.find({ filter: { id: params.id } });
    if (!specialization) {
      throw new AppError('Specialization not found', 404);
    }
    return specialization;
  }

  async getSubSpecializations(params: {
    parentId: string;
    filter?: Partial<SubSpecialization>;
    pagination?: PaginationOptions;
    sort?: SortOptions<SubSpecialization>;
  }): Promise<PaginatedResult<SubSpecialization>> {
    const { parentId, filter, pagination, sort } = params;

    const parent = await this.specializationRepository.find({ filter: { id: parentId } });
    if (!parent) {
      throw new AppError('Specialization not found', 404);
    }

    const finalFilter = { ...filter, mainSpecializationId: parentId };
    return await this.specializationRepository.findSubSpecializations({
      filter: finalFilter,
      pagination,
      sort,
    });
  }

  async createSpecialization(params: {
    input: CreateSpecializationInput;
  }): Promise<Specialization> {
    const { name, nameAr, category } = params.input;
    return await this.specializationRepository.create({
      specialization: { name, nameAr, category },
    });
  }

  async updateSpecialization(params: {
    id: string;
    input: UpdateSpecializationInput;
  }): Promise<Specialization> {
    const { id, input } = params;

    const existing = await this.specializationRepository.find({ filter: { id } });
    if (!existing) {
      throw new AppError('Specialization not found', 404);
    }

    return await this.specializationRepository.update({
      filter: { id },
      specialization: {
        ...existing,
        name: input.name ?? existing.name,
        nameAr: input.nameAr ?? existing.nameAr,
        category: input.category ?? existing.category,
      },
    });
  }

  async deleteSpecialization(params: { id: string }): Promise<void> {
    const { id } = params;

    const existing = await this.specializationRepository.find({ filter: { id } });
    if (!existing) {
      throw new AppError('Specialization not found', 404);
    }

    await this.specializationRepository.delete({ filter: { id } });
  }

  async createSubSpecialization(params: {
    parentId: string;
    input: CreateSubSpecializationInput;
  }): Promise<Specialization> {
    const { parentId, input } = params;

    const parent = await this.specializationRepository.find({ filter: { id: parentId } });
    if (!parent) {
      throw new AppError('Parent specialization not found', 404);
    }

    return await this.specializationRepository.createSubSpecialization({
      mainSpecializationId: parentId,
      subSpecialization: { name: input.name, nameAr: input.nameAr },
    });
  }

  async deleteSubSpecialization(params: { parentId: string; subId: string }): Promise<void> {
    const { parentId, subId } = params;

    const existing = await this.specializationRepository.findSubSpecialization({
      filter: { id: subId },
    });
    if (!existing) {
      throw new AppError('Sub-specialization not found', 404);
    }

    await this.specializationRepository.deleteSubSpecialization({
      filter: {
        id: subId,
        mainSpecializationId: parentId,
      },
    });
  }
}
