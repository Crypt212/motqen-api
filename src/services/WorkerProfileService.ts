/**
 * @fileoverview Worker Service - Handle worker operations
 * @module services/WorkerService
 */

import Service, { tryCatch } from './Service.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import {
  WorkerProfile,
  WorkerProfileFilter,
  WorkerProfileVerification,
  WorkerProfileVerificationCreateInput,
} from '../domain/workerProfile.entity.js';
import IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import IUserRepository from '../repositories/interfaces/UserRepository.js';
import { PaginationOptions, PaginatedResultMeta } from '../types/query.js';
import { GovernmentFilter } from '../domain/government.entity.js';
import { SpecializationsTree } from '../domain/specialization.entity.js';
import { WorkingHours } from '../domain/workingHours.entity.js';
import type { WorkingHoursDTO } from '../schemas/dashboard.js';

type InputWorkerData = {
  experienceYears: number;
  isInTeam: boolean;
  acceptsUrgentJobs: boolean;
  governmentIds: IDType[];
  specializationsTree: SpecializationsTree;
  profileImageBuffer: Buffer;
  idImageBuffer: Buffer;
  profileWithIdImageBuffer: Buffer;
};

type InputWorkerUpdateData = {
  experienceYears: number;
  isInTeam: boolean;
  acceptsUrgentJobs: boolean;
};

/**
 * Worker Service - Manages worker-related operations
 */
export default class WorkerService extends Service {
  private workerProfileRepository: IWorkerProfileRepository;
  private userRepository: IUserRepository;

  constructor(params: {
    workerProfileRepository: IWorkerProfileRepository;
    userRepository: IUserRepository;
  }) {
    super();
    this.workerProfileRepository = params.workerProfileRepository;
    this.userRepository = params.userRepository;
  }

  private mapWorkingHoursEntityToDTO(workingHours: WorkingHours): WorkingHoursDTO {
    return {
      daysOfWeek: workingHours.daysOfWeek
        .map((day) => Number.parseInt(day, 10))
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
      startTime: workingHours.startTime,
      endTime: workingHours.endTime,
    };
  }

  /**
   * Create a worker profile for a user
   * @throws {AppError} If user not found or invalid data
   */
  async create(params: { userId: IDType; workerProfile: InputWorkerData }): Promise<WorkerProfile> {
    const {
      userId,
      workerProfile: {
        experienceYears,
        isInTeam,
        acceptsUrgentJobs,
        governmentIds,
        specializationsTree,
        profileImageBuffer,
        idImageBuffer,
        profileWithIdImageBuffer,
      },
    } = params;
    return tryCatch(async () => {
      const nationalID = (
        await uploadToCloudinary(idImageBuffer, `${userId}/verification_info`, 'nationalID')
      ).url;
      const selfiWithID = (
        await uploadToCloudinary(
          profileWithIdImageBuffer,
          `${userId}/verification_info`,
          'selfiWithID'
        )
      ).url;

      const workerProfile = await this.workerProfileRepository.create({
        userId,
        workerProfile: {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
        },
      });

      await this.workerProfileRepository.insertWorkGovernments({
        workerFilter: { userId: workerProfile.userId },
        governmentIds,
      });
      await this.workerProfileRepository.insertSubSpecializations({
        workerFilter: { id: workerProfile.id },
        specializationsTree,
      });

      await this.workerProfileRepository.setVerification({
        workerProfileId: workerProfile.id,
        verification: {
          idWithPersonalImageUrl: selfiWithID,
          idDocumentUrl: nationalID,
          status: 'PENDING',
          reason: 'Waiting for verification',
        },
      });

      if (profileImageBuffer) {
        const { url } = await uploadToCloudinary(
          profileImageBuffer,
          `${userId}/profile_image`,
          'profileMain'
        );
        await this.userRepository.update({
          filter: { id: workerProfile.userId },
          user: { profileImageUrl: url },
        });
      }

      return workerProfile;
    });
  }

  /**
   * Update a worker's profile information
   * @throws {AppError} If profile not found
   */
  async update(params: {
    workerProfileId: IDType;
    data: InputWorkerUpdateData;
  }): Promise<WorkerProfile> {
    const {
      workerProfileId,
      data: { experienceYears, isInTeam, acceptsUrgentJobs },
    } = params;
    return tryCatch(async () => {
      return await this.workerProfileRepository.update({
        workerFilter: { id: workerProfileId },
        workerProfile: {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
        },
      });
    });
  }

  /**
   * Delete a worker's profile information
   * @throws {AppError} If profile not found
   */
  async delete(params: { workerProfileId: IDType }): Promise<void> {
    const { workerProfileId } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.delete({ workerFilter: { id: workerProfileId } });
    });
  }

  /**
   * Get working governments for worker
   */
  async getWorkGovernments(params: {
    pagination: PaginationOptions;
    filter: WorkerProfileFilter;
    GovernmentFilter: GovernmentFilter;
  }): Promise<PaginatedResultMeta & { governmentIds: IDType[] }> {
    const { pagination, GovernmentFilter: filter } = params;
    return tryCatch(async () => {
      const result = await this.workerProfileRepository.findWorkGovernments({
        pagination,
        workerFilter: filter,
      });
      return result;
    });
  }

  /**
   * Add working governments for worker
   */
  async insertWorkGovernments(params: {
    filter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void> {
    const { filter, governmentIds } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.insertWorkGovernments({
        workerFilter: filter,
        governmentIds,
      });
    });
  }

  /**
   * Delete all working governments for worker
   */
  async deleteAllWorkGovernments(params: { filter: WorkerProfileFilter }): Promise<void> {
    const { filter } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.deleteAllWorkGovernments({
        workerFilter: filter,
      });
    });
  }

  /**
   * Delete working governments for worker
   */
  async deleteWorkGovernments(params: {
    filter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void> {
    const { filter, governmentIds } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.deleteWorkGovernments({
        workerFilter: filter,
        governmentIds,
      });
    });
  }

  /**
   * Get specialization tree for worker
   */
  async getSpecializations(params: {
    mainSpecializationIds: IDType[];
    pagination: PaginationOptions;
    filter: WorkerProfileFilter;
  }): Promise<PaginatedResultMeta & { specializationIds: IDType[] }> {
    const { mainSpecializationIds, pagination, filter } = params;
    return tryCatch(async () => {
      const result = await this.workerProfileRepository.findSpecializations({
        mainSpecializationIds,
        pagination,
        filter,
      });
      return result;
    });
  }

  /**
   * Add specialization tree for worker
   */
  async addSpecializations(params: {
    filter: WorkerProfileFilter;
    specializationsTree: SpecializationsTree;
  }): Promise<void> {
    const { filter, specializationsTree } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.insertSubSpecializations({
        workerFilter: filter,
        specializationsTree,
      });
    });
  }

  /**
   * Delete all main specializations
   */
  async deleteAllSpecializations(params: { userId: IDType }): Promise<void> {
    const { userId } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.deleteAllSpecializations({
        workerFilter: { userId },
      });
    });
  }

  /**
   * Delete main specializations
   */
  async deleteSpecializations(params: {
    userId: IDType;
    mainSpecializationIds: IDType[];
  }): Promise<void> {
    const { userId, mainSpecializationIds } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.deleteSpecializations({
        workerFilter: { userId },
        specializations: mainSpecializationIds,
      });
    });
  }

  /**
   * Delete sub specializations
   */
  async deleteSubSpecializations(params: {
    userId: IDType;
    specializationsTree: SpecializationsTree;
  }): Promise<void> {
    const { userId, specializationsTree } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.deleteSubSpecializations({
        workerFilter: { userId },
        specializationsTree,
      });
    });
  }

  /**
   * Create or update worker profile verification
   */
  async createVerification(params: {
    workerProfileId: IDType;
    verification: WorkerProfileVerificationCreateInput;
  }): Promise<WorkerProfileVerification | null> {
    const { workerProfileId, verification } = params;
    return tryCatch(async () => {
      return await this.workerProfileRepository.setVerification({
        workerProfileId,
        verification,
      });
    });
  }

  /**
   * Get a worker profile's verification
   */
  async getVerification(params: {
    filter: WorkerProfileFilter;
  }): Promise<WorkerProfileVerification | null> {
    const { filter } = params;
    return tryCatch(async () => {
      return await this.workerProfileRepository.findVerification({ workerFilter: filter });
    });
  }

  /**
   * Get a worker's profile for a user
   */
  async get(params: { filter: WorkerProfileFilter }): Promise<WorkerProfile | null> {
    const { filter } = params;
    return tryCatch(async () => {
      return await this.workerProfileRepository.find({ workerFilter: filter });
    });
  }

  /**
   * Check if user has a worker profile
   */
  async hasWorkerProfile(params: { filter: WorkerProfileFilter }): Promise<boolean> {
    const { filter } = params;
    return await this.workerProfileRepository.exists({ workerFilter: filter });
  }

  async getMyWorkingHours(params: { userId: IDType }): Promise<WorkingHoursDTO[]> {
    const { userId } = params;
    return tryCatch(async () => {
      const workingHours = await this.workerProfileRepository.findWorkingHoursByUserId({ userId });

      if (!workingHours) return [];

      // Keep array response shape to support future multi-slot schedules.
      return [this.mapWorkingHoursEntityToDTO(workingHours)];
    });
  }
}
