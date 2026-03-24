import { SpecializationsTree } from "../../domain/specialization.entity.js";
import { WorkerProfile, WorkerProfileCreateInput, WorkerProfileFilter, WorkerProfileUpdateInput, WorkerProfileVerification, WorkerProfileVerificationCreateInput } from "../../domain/workerProfile.entity.js";
import { PaginationOptions, PaginatedResult, SortOptions } from "../../types/query.js";
import { IDType } from "../interfaces/Repository.js";


export default interface IWorkerProfileRepository {
  /**
   * Check if worker profile exists
   */
  exists(params: { filter: WorkerProfileFilter }): Promise<boolean>;
  /**
   * Find worker profile
   */
  find(params: { filter: WorkerProfileFilter }): Promise<WorkerProfile | null>;
  /**
   * Find many online users' worker profiles
   */
  findOnline(params: { filter: WorkerProfileFilter, pagination?: PaginationOptions, sort?: SortOptions<WorkerProfile> }): Promise<PaginatedResult<WorkerProfile>>
  /**
   * Find work governments
   */
  findWorkGovernments(params: { filter: WorkerProfileFilter, pagination?: PaginationOptions }): Promise<PaginatedResult<IDType>>
  /**
   * Find verification of a worker profile
   */
  findVerification(params: { filter: WorkerProfileFilter }): Promise<WorkerProfileVerification | null>;
  /**
   * Find work governments
   */
  findSpecializations(params: { mainSpecializationIds: IDType[], filter: WorkerProfileFilter, pagination?: PaginationOptions }): Promise<PaginatedResult<IDType>>

  /**
   * Create a worker profile for a user ID
   */
  create(params: { userId: IDType, workerProfile: WorkerProfileCreateInput }): Promise<WorkerProfile>;
  /**
   * Insert working governments
   */
  insertWorkGovernments(params: { filter: WorkerProfileFilter, governmentIds: IDType[] }): Promise<void>
  /**
   * Insert specializations
   */
  insertSpecializations(params: { filter: WorkerProfileFilter, specializations: IDType[] }): Promise<void>
  /**
   * Insert specializations and sub-specializations through a tree
   */
  insertSubSpecializations(params: { filter: WorkerProfileFilter, specializationsTree: SpecializationsTree }): Promise<void>
  /**
   * Set verification of a worker profile
   */
  setVerification(params: { workerProfileId: IDType, verification: WorkerProfileVerificationCreateInput }): Promise<WorkerProfileVerification>;
  /**
   * Update a worker profile
   */
  update(params: { filter: WorkerProfileFilter, workerProfile: WorkerProfileUpdateInput }): Promise<WorkerProfile>;
  /**
   * Deletes a worker profile
   */
  delete(params: { filter: WorkerProfileFilter }): Promise<void>;
  /**
   * Delete working governments
   */
  deleteAllWorkGovernments(params: { filter: WorkerProfileFilter }): Promise<void>
  /**
   * Delete working governments
   */
  deleteWorkGovernments(params: { filter: WorkerProfileFilter, governmentIds: IDType[] }): Promise<void>
  /**
   * Delete specializations
   */
  deleteSpecializations(params: { filter: WorkerProfileFilter, specializations: IDType[] }): Promise<void>
  /**
   * Delete all specializations
   */
  deleteAllSpecializations(params: { filter: WorkerProfileFilter }): Promise<void>
  /**
   * Delete specializations and sub-specializations through a tree
   */
  deleteSubSpecializations(params: { filter: WorkerProfileFilter, specializationsTree: SpecializationsTree }): Promise<void>
}
