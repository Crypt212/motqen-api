import { User, UserCreateInput, UserFilter, UserUpdateInput } from '../../domain/user.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';

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
  }): Promise<PaginatedResultMeta & { users: User[] }>;
  /**
   * Find many online users' worker profiles
   */
  findOnline(params: {
    filter: UserFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<User>;
  }): Promise<PaginatedResultMeta & { users: User[] }>;

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
}
