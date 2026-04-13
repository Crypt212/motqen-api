import {
  User,
  UserCreateInput,
  UserFilter,
  UserUpdateInput,
  Location,
  LocationCreateInput,
  LocationUpdateInput,
} from '../../domain/user.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';
import { IDType } from './Repository.js';

export default interface IUserRepository {
  /**
   * Check if user exists
   */
  exists(params: { filter: UserFilter }): Promise<boolean>;
  /**
   * Find user
   */
  find(params: { filter: UserFilter }): Promise<User | null>;
  /**
   * Find users
   */
  findMany(params: {
    filter: UserFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<User>;
  }): Promise<PaginatedResult<{ users: User[] }>>;
  /**
   * Find many online users' worker profiles
   */
  findOnline(params: {
    filter: UserFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<User>;
  }): Promise<PaginatedResult<{ users: User[] }>>;

  /**
   * Create a user
   */
  create(params: { user: UserCreateInput }): Promise<User>;
  /**
   * Update a user
   */
  update(params: { filter: UserFilter; user: UserUpdateInput }): Promise<User>;

  /**
   * Delete a user
   */
  delete(params: { filter: UserFilter }): Promise<void>;

  // ─── Location methods ─────────────────────────────────────────────────

  /**
   * Find a user with their primary (isMain=true) location
   */
  findWithPrimaryLocation(params: {
    filter: UserFilter;
  }): Promise<(User & { location: Location }) | null>;

  findLocations(params: {
    filter: { userId: IDType };
    pagination?: PaginationOptions;
  }): Promise<PaginatedResultMeta & { locations: Location[] }>;
  updateLocation(params: {
    filter: { id: IDType; userId: IDType };
    location: LocationUpdateInput;
  }): Promise<Location>;
  deleteLocation(params: { filter: { id: IDType; userId: IDType } }): Promise<void>;

  /**
   * Add a location to a user
   */
  addLocation(params: { userId: IDType; location: LocationCreateInput }): Promise<Location>;

  /**
   * Update a user's primary location
   */
  updatePrimaryLocation(params: {
    userId: IDType;
    location: LocationUpdateInput;
  }): Promise<Location>;
}
