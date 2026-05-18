/**
 * @fileoverview Worker Service - Handle worker operations
 * @module services/WorkerService
 */

import Service, { tryCatch } from './Service.js';
import uploadToCloudinary, { deleteFromCloudinary } from '../providers/cloudinaryProvider.js';
import AppError from '../errors/AppError.js';
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
import { Government, GovernmentFilter } from '../domain/government.entity.js';
import { SpecializationsTree, SpecializationsWithSubSpecializations } from '../domain/specialization.entity.js';
import { Day, DayWorkingHours, DayWorkingHoursCreateInput, DayWorkingHoursReturn } from '../domain/workingHours.entity.js';
import type { DaysWorkingHoursDTO as DaysWorkingHoursDTO } from '../schemas/requests/worker-profile.request.js';
import IDataCache from '../cache/interfaces/DataCache.js';
import { ExploreWorkerPublicDetail } from '../types/exploreWorker.js';

type InputWorkerData = {
  experienceYears: number;
  isInTeam: boolean;
  acceptsUrgentJobs: boolean;
  governmentIds: IDType[];
  specializationsTree: SpecializationsTree;
  profileImageBuffer: Buffer;
  idImageBuffer: Buffer;
  profileWithIdImageBuffer: Buffer;
  bio?: string;
};

type InputWorkerUpdateData = {
  experienceYears?: number;
  isInTeam?: boolean;
  acceptsUrgentJobs?: boolean;
  bio?: string;
};

/**
 * Worker Service - Manages worker-related operations
 */
export default class WorkerService extends Service {
  private workerProfileRepository: IWorkerProfileRepository;
  private userRepository: IUserRepository;
  private dataCache?: IDataCache;

  constructor(params: {
    workerProfileRepository: IWorkerProfileRepository;
    userRepository: IUserRepository;
    dataCache?: IDataCache;
  }) {
    super();
    this.workerProfileRepository = params.workerProfileRepository;
    this.userRepository = params.userRepository;
    this.dataCache = params.dataCache;
  }

  private mapWorkingHoursEntityToDTO(daysWorkingHours: DayWorkingHoursReturn[]): DaysWorkingHoursDTO {
    return daysWorkingHours.map((workingHours) => ({
      day: workingHours.day,
      startTime: workingHours.startTime,
      endTime: workingHours.endTime,
    }));
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
        bio,
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
          bio,
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
      data: { experienceYears, isInTeam, acceptsUrgentJobs, bio },
    } = params;
    return tryCatch(async () => {
      const result = await this.workerProfileRepository.update({
        workerFilter: { id: workerProfileId },
        workerProfile: {
          experienceYears,
          isInTeam,
          acceptsUrgentJobs,
          bio,
        },
      });
      if (this.dataCache && result.userId) {
        await this.dataCache.del(`data:worker:explore:${result.userId}`);
      }
      return result;
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
  }): Promise<PaginatedResultMeta & { governments: Government[] }> {
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

  async getExploreWorkerById(params: { userId: IDType }): Promise<ExploreWorkerPublicDetail | null> {
    const { userId } = params;
    return tryCatch(async () => {
      const result = await this.workerProfileRepository.findExploreWorkerById(userId as string);
      return result;
    });
  }

  /**
   * Get specialization tree for worker
   */
  async getSpecializationsTree(params: {
    filter: WorkerProfileFilter;
  }): Promise<SpecializationsWithSubSpecializations> {
    const { filter } = params;

    return tryCatch(async () => {
      const result = await this.workerProfileRepository.findSpecializationsWithSubSpecializations({
        filter,
      });
      return result;
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
      if (this.dataCache && filter.userId) {
        await this.dataCache.del(`data:worker:${filter.userId}:spec-tree`).catch(() => { });
      }
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
      if (this.dataCache) {
        await this.dataCache.del(`data:worker:${userId}:spec-tree`).catch(() => { });
      }
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
      if (this.dataCache) {
        await this.dataCache.del(`data:worker:${userId}:spec-tree`).catch(() => { });
      }
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
      if (this.dataCache) {
        await this.dataCache.del(`data:worker:${userId}:spec-tree`).catch(() => { });
      }
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
  }): Promise<Omit<WorkerProfileVerification, 'idWithPersonalImageUrl' | 'idDocumentUrl'> | null> {
    const { filter } = params;
    return tryCatch(async () => {
      const verification = await this.workerProfileRepository.findVerification({ workerFilter: filter });
      if (!verification) return null;
      const { idWithPersonalImageUrl, idDocumentUrl, ...safeVerification } = verification;
      return safeVerification;
    });
  }

  /**
   * Resubmit verification documents
   */
  async resubmitVerification(params: {
    userId: IDType;
    idImageBuffer: Buffer;
    profileWithIdImageBuffer: Buffer;
  }): Promise<Omit<WorkerProfileVerification, 'idWithPersonalImageUrl' | 'idDocumentUrl'>> {
    const { userId, idImageBuffer, profileWithIdImageBuffer } = params;
    return tryCatch(async () => {
      const profile = await this.workerProfileRepository.find({ workerFilter: { userId } });
      if (!profile) throw new AppError('Worker profile not found', 404);

      const verification = await this.workerProfileRepository.findVerification({ workerFilter: { userId } });
      if (!verification) throw new AppError('Verification not found', 404);

      if (verification.status === 'PENDING') throw new AppError('Verification review is in progress', 409);
      if (verification.status === 'APPROVED') throw new AppError('Cannot resubmit when already approved', 409);

      const prevNationalIdUrl = verification.idDocumentUrl;
      const prevSelfieUrl = verification.idWithPersonalImageUrl;

      const nationalIdUpload = await uploadToCloudinary(idImageBuffer, `${userId}/verification_info`, `nationalID_${crypto.randomUUID()}`);
      const selfieUpload = await uploadToCloudinary(profileWithIdImageBuffer, `${userId}/verification_info`, `selfiWithID_${crypto.randomUUID()}`);

      let updatedVerification: WorkerProfileVerification;
      try {
        updatedVerification = await this.workerProfileRepository.setVerification({
          workerProfileId: profile.id,
          verification: {
            idWithPersonalImageUrl: selfieUpload.url,
            idDocumentUrl: nationalIdUpload.url,
            status: 'PENDING',
            reason: '',
          },
        });
      } catch (err) {
        await Promise.allSettled([
          deleteFromCloudinary(nationalIdUpload.publicId),
          deleteFromCloudinary(selfieUpload.publicId),
        ]);
        throw err;
      }

      const getPublicIdFromUrl = (url: string) => {
        const parts = url.split('/');
        return parts.slice(-3).join('/').replace(/\\.[^.]+$/, '');
      };

      if (prevNationalIdUrl) {
        deleteFromCloudinary(getPublicIdFromUrl(prevNationalIdUrl)).catch(() => { });
      }
      if (prevSelfieUrl) {
        deleteFromCloudinary(getPublicIdFromUrl(prevSelfieUrl)).catch(() => { });
      }

      const { idWithPersonalImageUrl, idDocumentUrl, ...safeVerification } = updatedVerification;
      return safeVerification;
    });
  }

  async createPortfolio(params: { userId: IDType; description?: string }) {
    const { userId, description } = params;
    return tryCatch(async () => {
      const profile = await this.workerProfileRepository.find({ workerFilter: { userId } });
      if (!profile) throw new AppError('Worker profile not found', 404);

      const existing = await this.workerProfileRepository.findPortfolio({ workerProfileId: profile.id });
      if (existing) throw new AppError('Portfolio already exists', 409);

      const result = await this.workerProfileRepository.createPortfolio({ workerProfileId: profile.id, description });
      if (this.dataCache) {
        await this.dataCache.del(`data:worker:explore:${userId}`);
      }
      return result;
    });
  }

  async getPortfolio(params: { userId: IDType }) {
    const { userId } = params;
    return tryCatch(async () => {
      const profile = await this.workerProfileRepository.find({ workerFilter: { userId } });
      if (!profile) throw new AppError('Worker profile not found', 404);

      return await this.workerProfileRepository.findPortfolio({ workerProfileId: profile.id });
    });
  }

  async updatePortfolio(params: { userId: IDType; description?: string }) {
    const { userId, description } = params;
    return tryCatch(async () => {
      const profile = await this.workerProfileRepository.find({ workerFilter: { userId } });
      if (!profile) throw new AppError('Worker profile not found', 404);

      const portfolio = await this.workerProfileRepository.findPortfolio({ workerProfileId: profile.id });
      if (!portfolio) throw new AppError('Portfolio must be created first', 404);

      const result = await this.workerProfileRepository.updatePortfolio({ workerProfileId: profile.id, description });
      if (this.dataCache) {
        await this.dataCache.del(`data:worker:explore:${userId}`);
      }
      return result;
    });
  }

  async addPortfolioImages(params: { userId: IDType; files: Express.Multer.File[] }) {
    const { userId, files } = params;
    return tryCatch(async () => {
      const profile = await this.workerProfileRepository.find({ workerFilter: { userId } });
      if (!profile) throw new AppError('Worker profile not found', 404);

      const portfolio = await this.workerProfileRepository.findPortfolio({ workerProfileId: profile.id });
      if (!portfolio) throw new AppError('Portfolio must be created first', 400);

      if (files.length > 10) throw new AppError('Maximum 10 images allowed per portfolio', 400);

      const uploadPromises = files.map((file, i) =>
        uploadToCloudinary(file.buffer, `${userId}/portfolio`, `img_${crypto.randomUUID()}_${i}`)
      );
      const uploaded = await Promise.all(uploadPromises);
      const imageUrls = uploaded.map(u => u.url);

      try {
        const result = await this.workerProfileRepository.addPortfolioImages({ portfolioId: portfolio.id, imageUrls });
        if (this.dataCache) {
          await this.dataCache.del(`data:worker:explore:${userId}`);
        }
        return result;
      } catch (dbError: any) {
        // Rollback: clean up uploaded Cloudinary images if DB write fails
        await Promise.allSettled(uploaded.map(u => deleteFromCloudinary(u.publicId)));
        if (dbError.message === 'LIMIT_EXCEEDED') {
          throw new AppError('Maximum 10 images allowed per portfolio', 400);
        }
        throw dbError;
      }
    });
  }

  async deletePortfolioImage(params: { userId: IDType; imageId: IDType }) {
    const { userId, imageId } = params;
    return tryCatch(async () => {
      const profile = await this.workerProfileRepository.find({ workerFilter: { userId } });
      if (!profile) throw new AppError('Worker profile not found', 404);

      const image = await this.workerProfileRepository.findPortfolioImage({ imageId });
      if (!image) throw new AppError('Portfolio image not found', 404);

      if (image.portfolio.workerProfileId !== profile.id) throw new AppError('Forbidden: Image belongs to another worker', 403);

      // Extract Cloudinary public_id from the URL for cleanup
      const urlParts = image.imageUrl.split('/');
      const publicIdWithExt = urlParts.slice(-3).join('/'); // folder/subfolder/filename
      const publicId = publicIdWithExt.replace(/\.[^.]+$/, ''); // strip extension

      // Retryable Cloudinary deletion
      let retries = 3;
      let cloudDeleted = false;
      while (retries > 0) {
        try {
          await deleteFromCloudinary(publicId);
          cloudDeleted = true;
          break;
        } catch (e) {
          retries--;
          if (retries === 0) break;
          await new Promise(res => setTimeout(res, 1000 * (4 - retries))); // backoff
        }
      }

      if (!cloudDeleted) {
        throw new AppError('Failed to delete image from cloud storage, aborting', 500);
      }

      await this.workerProfileRepository.deletePortfolioImage({ imageId });
      if (this.dataCache) {
        await this.dataCache.del(`data:worker:explore:${userId}`);
      }
    });
  }

  async getWorkerOccupiedTimeSlots(params: { userId: IDType; selectedDate: string }) {
    const { userId, selectedDate } = params;
    return tryCatch(async () => {
      return await this.workerProfileRepository.findOccupiedTimeSlots({ workerId: userId as string, selectedDate });
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

  /**
   * Get worker's working hours of all work days
   */
  async getMyWorkingHours(params: { userId: IDType }): Promise<DaysWorkingHoursDTO> {
    const { userId } = params;
    return tryCatch(async () => {
      const workingHours = await this.workerProfileRepository.findDaysWorkingHoursByUserId({ userId });

      if (!workingHours) return [];

      return this.mapWorkingHoursEntityToDTO(workingHours);
    });
  }

  async addDaysWorkingHours(params: {
    workerProfileId: IDType;
    daysWorkingHours: DayWorkingHoursCreateInput[]
  }): Promise<DaysWorkingHoursDTO> {
    const { workerProfileId, daysWorkingHours } = params;
    return tryCatch(async () => {
      const workingHours =  await this.workerProfileRepository.addDaysWorkingHours({
        workerProfileId,
        daysWorkingHours
      });
      if (!workingHours) return [];

      return this.mapWorkingHoursEntityToDTO(workingHours);
    });
  }

  async removeDaysWorkingHours(params: {
    workerProfileId: IDType;
    days: Day[];
  }): Promise<void> {
    const { workerProfileId, days } = params;
    return tryCatch(async () => {
      await this.workerProfileRepository.removeDaysWorkingHours({
        workerProfileId: workerProfileId as string,
        days
      });
    });
  }
}
