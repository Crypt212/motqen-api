import {
  ClientProfile,
  ClientProfileCreateInput,
  ClientProfileFilter,
  ClientProfileUpdateInput,
} from '../../domain/clientProfile.entity.js';
import { IDType } from '../interfaces/Repository.js';

export default interface IClientProfileRepository {
  /**
   * Find client profile
   */
  find(params: { filter: ClientProfileFilter }): Promise<ClientProfile | null>;
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
   * Update a client profile
   */
  update(params: {
    filter: ClientProfileFilter;
    clientProfile: ClientProfileUpdateInput;
  }): Promise<ClientProfile>;
  /**
   * Deletes a client profile
   */
  delete(params: { filter: ClientProfileFilter }): Promise<void>;
}
