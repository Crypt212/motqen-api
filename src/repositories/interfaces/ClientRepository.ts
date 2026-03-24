import {
  ClientProfile,
  ClientProfileCreateInput,
  ClientProfileFilter,
  ClientProfileUpdateInput,
  Location,
  LocationCreateInput,
  LocationUpdateInput,
} from '../../domain/clientProfile.entity.js';
import { IDType } from '../interfaces/Repository.js';

export default interface IClientProfileRepository {
  /**
   * Find client profile
   */
  find(params: { filter: ClientProfileFilter }): Promise<ClientProfile | null>;
  /**
   * Find a client profile with its primary location
   */
  findWithPrimaryLocation(params: {
    filter: ClientProfileFilter;
  }): Promise<(ClientProfile & { location: Location }) | null>;
  /**
   * Check if client profile exists
   */
  exists(params: { filter: ClientProfileFilter }): Promise<boolean>;

  /**
   * Create a client profile
   */
  create(params: {
    userId: IDType;
    clientProfile: ClientProfileCreateInput;
  }): Promise<ClientProfile>;
  /**
   * Create a client profile with a primary location attached to it for a user ID
   */
  createWithPrimaryLocation(params: {
    userId: IDType;
    clientProfile: ClientProfileCreateInput;
    location: LocationCreateInput;
  }): Promise<ClientProfile & { location: Location }>;
  /**
   * Update a client profile
   */
  update(params: {
    filter: ClientProfileFilter;
    clientProfile: ClientProfileUpdateInput;
  }): Promise<ClientProfile>;
  /**
   * Update a client profile and its primary location
   */
  updateWithPrimaryLocation(params: {
    filter: ClientProfileFilter;
    clientProfile: ClientProfileUpdateInput;
    location: LocationUpdateInput;
  }): Promise<ClientProfile & { location: Location }>;
  /**
   * Deletes a client profile
   */
  delete(params: { filter: ClientProfileFilter }): Promise<void>;
}
