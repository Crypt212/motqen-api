import { User, UserCreateInput, UsersFilter, UserUpdateInput } from '../../domain/user.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';

export default interface IUserRepository {
  /**
   * Check if user exists
   */
  exists(params: { filter: UsersFilter }): Promise<boolean>;
  /**
   * Find user
   */
  find(params: { filter: UsersFilter }): Promise<User | null>;
  /**
   * Find users
   */
  findMany(params: { filter: UsersFilter, pagination?: PaginationOptions, sort?: SortOptions<User> }): Promise<PaginatedResult<User>>;
  /**
   * Find many online users' worker profiles
   */
  findOnline(params: { filter: UsersFilter, pagination?: PaginationOptions, sort?: SortOptions<User> }): Promise<PaginatedResult<User>>;

  /**
   * Create a user
   */
  create(params: { user: UserCreateInput }): Promise<User>;
  /**
   * Update a user
   */
  update(params: { filter: UsersFilter, user: UserUpdateInput }): Promise<User>;

  /**
   * Delete a user
   */
  delete(params: { filter: UsersFilter }): Promise<void>;
}
