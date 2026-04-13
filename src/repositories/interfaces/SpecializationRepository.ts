import {
  Specialization,
  SpecializationCreateInput,
  SpecializationFilter,
  SubSpecialization,
  SubSpecializationCreateInput,
  SubSpecializationFilter,
} from '../../domain/specialization.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';
import { IDType } from './Repository.js';

export default interface ISpecializationRepository {
  /**
   * Find a specialization
   */
  find: (params: { filter: SpecializationFilter }) => Promise<Specialization | null>;
  /**
   * Find many specializations
   */
  findMany: (params: {
    filter: SpecializationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Specialization>;
  }) => Promise<PaginatedResult<{ specializations: Specialization[] }>>;
  /**
   * Find a sub-specialization
   */
  findSubSpecialization: (params: {
    filter: SubSpecializationFilter;
  }) => Promise<SubSpecialization | null>;
  /**
   * Find many specializations
   */
  findSubSpecializations: (params: {
    filter: SubSpecializationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<SubSpecialization>;
  }) => Promise<PaginatedResult<{ subSpecializations: SubSpecialization[] }>>;

  /**
   * create a specialization
   */
  create: (params: { specialization: SpecializationCreateInput }) => Promise<Specialization>;
  /**
   * create a sub-specialization
   */
  createSubSpecialization: (params: {
    mainSpecializationId: IDType;
    subSpecialization: SubSpecializationCreateInput;
  }) => Promise<Specialization>;
  /**
   * update a specialization
   */
  update: (params: {
    filter: SpecializationFilter;
    specialization: Specialization;
  }) => Promise<Specialization>;
  /**
   * update a sub-specialization
   */
  updateSubSpecialization: (params: {
    filter: SubSpecializationFilter;
    subSpecialization: SubSpecialization;
  }) => Promise<SubSpecialization>;
  /**
   * delete a specialization
   */
  delete: (params: { filter: SpecializationFilter }) => Promise<void>;
  /**
   * delete a sub-specialization
   */
  deleteSubSpecialization: (params: { filter: SubSpecializationFilter }) => Promise<void>;
}
