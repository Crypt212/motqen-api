/**
 * @fileoverview User Service - Handle user operations
 * @module services/UserService
 */

import Service from './Service.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import IUserRepository from '../repositories/interfaces/UserRepository.js';
import IClientProfileRepository from '../repositories/interfaces/ClientRepository.js';
import IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import {
  AccountStatus,
  Role,
  User,
  UserFilter,
  LocationCreateInput,
  LocationUpdateInput,
  Location,
} from '../domain/user.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../types/query.js';
import { UserState } from '../types/asyncHandler.js';
import { IDType } from '../repositories/interfaces/Repository.js';

type InputUserType = {
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: Role;
  status: AccountStatus;
  profileImageBuffer: Buffer;
};

/**
 * User Service - Manages user-related operations
 */
export default class UserService extends Service {
  private userRepository: IUserRepository;
  private workerProfileRepository: IWorkerProfileRepository;
  private clientProfileRepository: IClientProfileRepository;

  constructor(params: {
    userRepository: IUserRepository;
    workerProfileRepository: IWorkerProfileRepository;
    clientProfileRepository: IClientProfileRepository;
  }) {
    super();
    this.userRepository = params.userRepository;
    this.workerProfileRepository = params.workerProfileRepository;
    this.clientProfileRepository = params.clientProfileRepository;
  }

  /**
   * Get a user by ID or phone number
   */
  async get(params: { filter: UserFilter }): Promise<User | null> {
    const { filter } = params;
    const user = await this.userRepository.find({ filter });
    return user;
  }

  /**
   * Find many users with pagination, filtering, and ordering
   */
  async findMany(params: {
    filter: UserFilter;
    pagination: PaginationOptions;
    sort: SortOptions<User>;
  }): Promise<PaginatedResult<{ users: User[] }>> {
    const { filter, pagination, sort: orderBy } = params;

    return await this.userRepository.findMany({
      filter,
      pagination,
      sort: orderBy,
    });
  }

  /**
   * Update a user's basic information
   */
  async update(params: { filter: UserFilter; data: Partial<InputUserType> }): Promise<User | null> {
    const { filter, data } = params;
    let url = undefined;
    if (data.profileImageBuffer) {
      url = (
        await uploadToCloudinary(
          data.profileImageBuffer,
          `${filter.id}/profile_image`,
          'profileMain'
        )
      ).url;
    }

    await this.userRepository.update({
      filter,
      user: {
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status,
        profileImageUrl: typeof url === 'string' ? url : undefined,
      },
    });
    return await this.userRepository.find({ filter });
  }

  /**
   * Get all roles of a user
   */
  async getStatus(params: { filter: UserFilter }): Promise<UserState> {
    const { filter } = params;
    const user = await this.userRepository.find({ filter });
    const worker = await this.workerProfileRepository.find({ workerFilter: { userId: user.id } });
    let verification = null;
    if (worker)
      verification = await this.workerProfileRepository.findVerification({
        workerFilter: { id: worker.id },
      });
    const client = await this.clientProfileRepository.find({ filter: { userId: user.id } });

    const userState = {
      role: user.role,
      userId: user.id,
      phoneNumber: user.phoneNumber,
      accountStatus: user.status,
      worker: worker
        ? {
            id: worker.id,
            verification: {
              status: verification.status,
              reason: verification.reason,
            },
          }
        : undefined,
      client: client ? { id: client.id } : undefined,
    };

    return userState;
  }

  /**
   * Check if user exists
   */
  async exists(params: { filter: UserFilter }): Promise<boolean> {
    const { filter } = params;
    return await this.userRepository.exists({ filter });
  }

  // ============================================
  // Location proxy endpoints
  // ============================================

  async getLocations(params: {
    filter: { userId: IDType };
    pagination?: PaginationOptions;
  }): Promise<PaginatedResultMeta & { locations: Location[] }> {
    return await this.userRepository.findLocations(params);
  }

  async addLocation(params: { userId: IDType; location: LocationCreateInput }): Promise<Location> {
    return await this.userRepository.addLocation(params);
  }

  async updateLocation(params: {
    filter: { id: IDType; userId: IDType };
    location: LocationUpdateInput;
  }): Promise<Location> {
    return await this.userRepository.updateLocation(params);
  }

  async deleteLocation(params: { filter: { id: IDType; userId: IDType } }): Promise<void> {
    return await this.userRepository.deleteLocation(params);
  }
}
