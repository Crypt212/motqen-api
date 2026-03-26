/**
 * @fileoverview Client Service - Handle client operations
 * @module services/ClientService
 */

import AppError from '../errors/AppError.js';
import Service, { tryCatch } from './Service.js';
import IUserRepository from '../repositories/interfaces/UserRepository.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import IClientProfileRepository from '../repositories/interfaces/ClientRepository.js';
import {
  ClientProfile,
  ClientProfileCreateInput,
  ClientProfileFilter,
  ClientProfileUpdateInput,
  LocationCreateInput,
  LocationUpdateInput,
} from '../domain/clientProfile.entity.js';

/**
 * Client Service - Manages client-related operations
 */
export default class ClientService extends Service {
  private clientProfileRepository: IClientProfileRepository;
  private userRepository: IUserRepository;

  /**
   * @param {Object} params
   * @param {ClientRepository} params.clientRepository
   * @param {UserRepository} params.userRepository
   */
  constructor(params: {
    clientProfileRepository: IClientProfileRepository;
    userRepository: IUserRepository;
  }) {
    super();
    this.clientProfileRepository = params.clientProfileRepository;
    this.userRepository = params.userRepository;
  }

  /**
   * Get a client's profile for a user
   * @throws {AppError} If user or profile not found
   */
  async get(params: ClientProfileFilter): Promise<ClientProfile | null> {
    return tryCatch(async () => {
      const { userId } = params;
      const user = await this.userRepository.find({ filter: { id: userId } });
      if (!user) throw new AppError('User not found', 404);

      const clientProfile = await this.clientProfileRepository.find({ filter: { userId } });
      if (!clientProfile) throw new AppError('Client profile not found', 404);

      return clientProfile;
    });
  }

  /**
   * Create a client profile for a user
   * @throws {AppError} If user not found
   */
  async create(params: {
    userId: IDType;
    data: ClientProfileCreateInput & { location: LocationCreateInput };
  }): Promise<ClientProfile | null> {
    return tryCatch(async () => {
      const { userId, data } = params;
      const user = await this.userRepository.find({ filter: { id: userId } });
      if (!user) throw new AppError('User not found', 404);

      const clientProfile = await this.clientProfileRepository.createWithPrimaryLocation({
        userId,
        clientProfile: {},
        location: {
          governmentId: data.location.governmentId,
          cityId: data.location.cityId,
          address: data.location.address,
          addressNotes: data.location.addressNotes,
          isMain: true,
        },
      });

      return clientProfile;
    });
  }

  /**
   * Update a client's profile for a user
   * @throws {AppError} If profile not found
   */
  async update(params: {
    filter: ClientProfileFilter;
    data: ClientProfileUpdateInput & { location?: LocationUpdateInput };
  }): Promise<ClientProfile | null> {
    return tryCatch(async () => {
      const { filter, data } = params;
      return await this.clientProfileRepository.updateWithPrimaryLocation({
        filter,
        clientProfile: { data },
        location: data.location,
      });
    });
  }

  /**
   * Delete a client's profile information
   * @throws {AppError} If profile not found
   */
  async delete(params: { filter: ClientProfileFilter }): Promise<ClientProfile | null> {
    return tryCatch(async () => {
      const { filter } = params;
      return await this.clientProfileRepository.delete({ filter });
    });
  }

  /**
   * Check if user has a client profile
   */
  async hasClientProfile(params: { filter: ClientProfileFilter }): Promise<boolean> {
    const { filter } = params;
    return await this.clientProfileRepository.exists({ filter });
  }
}
