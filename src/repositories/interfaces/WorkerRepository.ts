import type { ExploreWorkerPublicDetail } from '../../types/exploreWorker.js';
import { SpecializationsTree } from '../../domain/specialization.entity.js';
import {
  WorkerProfile,
  WorkerProfileCreateInput,
  WorkerProfileFilter,
  WorkerProfileUpdateInput,
  WorkerProfileVerification,
  WorkerProfileVerificationCreateInput,
} from '../../domain/workerProfile.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { IDType } from '../interfaces/Repository.js';

export default interface IWorkerProfileRepository {
  /**
   * Check if worker profile exists
   */
  exists(params: { workerFilter: WorkerProfileFilter }): Promise<boolean>;
  /**
   * Find worker profile
   */
  find(params: { workerFilter: WorkerProfileFilter }): Promise<WorkerProfile | null>;
  /**
   * Explore: approved + active user, full public payload with user, portfolio, project images
   */
  findExploreWorkerById(workerProfileId: string): Promise<ExploreWorkerPublicDetail | null>;
  /**
   * Find many online users' worker profiles
   */
  findOnline(params: {
    workerFilter: WorkerProfileFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<WorkerProfile>;
  }): Promise<PaginatedResultMeta & { workerProfiles: WorkerProfile[] }>;
  /**
   * Find work governments
   */
  findWorkGovernments(params: {
    workerFilter: WorkerProfileFilter;
    pagination?: PaginationOptions;
  }): Promise<PaginatedResultMeta & { governmentIds: IDType[] }>;
  /**
   * Find verification of a worker profile
   */
  findVerification(params: {
    workerFilter: WorkerProfileFilter;
  }): Promise<WorkerProfileVerification | null>;
  /**
   * Find work governments
   */
  findSpecializations(params: {
    mainSpecializationIds: IDType[];
    filter: WorkerProfileFilter;
    pagination?: PaginationOptions;
  }): Promise<PaginatedResultMeta & { specializationIds: IDType[] }>;

  /**
   * Create a worker profile for a user ID
   */
  create(params: {
    userId: IDType;
    workerProfile: WorkerProfileCreateInput;
  }): Promise<WorkerProfile>;
  /**
   * Insert working governments
   */
  insertWorkGovernments(params: {
    workerFilter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void>;
  /**
   * Insert specializations
   */
  insertSpecializations(params: {
    workerFilter: WorkerProfileFilter;
    specializations: IDType[];
  }): Promise<void>;
  /**
   * Insert specializations and sub-specializations through a tree
   */
  insertSubSpecializations(params: {
    workerFilter: WorkerProfileFilter;
    specializationsTree: SpecializationsTree;
  }): Promise<void>;
  /**
   * Set verification of a worker profile
   */
  setVerification(params: {
    workerProfileId: IDType;
    verification: WorkerProfileVerificationCreateInput;
  }): Promise<WorkerProfileVerification>;
  /**
   * Update a worker profile
   */
  update(params: {
    workerFilter: WorkerProfileFilter;
    workerProfile: WorkerProfileUpdateInput;
  }): Promise<WorkerProfile>;
  /**
   * Deletes a worker profile
   */
  delete(params: { workerFilter: WorkerProfileFilter }): Promise<void>;
  /**
   * Delete working governments
   */
  deleteAllWorkGovernments(params: { workerFilter: WorkerProfileFilter }): Promise<void>;
  /**
   * Delete working governments
   */
  deleteWorkGovernments(params: {
    workerFilter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void>;
  /**
   * Delete specializations
   */
  deleteSpecializations(params: {
    workerFilter: WorkerProfileFilter;
    specializations: IDType[];
  }): Promise<void>;
  /**
   * Delete all specializations
   */
  deleteAllSpecializations(params: { workerFilter: WorkerProfileFilter }): Promise<void>;
  /**
   * Delete specializations and sub-specializations through a tree
   */
  deleteSubSpecializations(params: {
    workerFilter: WorkerProfileFilter;
    specializationsTree: SpecializationsTree;
  }): Promise<void>;
}
