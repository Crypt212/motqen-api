import {
  City,
  CityCreateInput,
  CityFilter,
  Government,
  GovernmentCreateInput,
  GovernmentFilter,
  GovernmentUpdateInput,
} from '../../domain/government.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';
import { IDType } from './Repository.js';

export default interface IGovernemntRepository {
  /**
   * Find a government
   */
  find(params: { filter: GovernmentFilter }): Promise<Government | null>;
  /**
   * Find governments
   */
  findMany(params: {
    filter: GovernmentFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Government>;
  }): Promise<PaginatedResult<Government>>;
  /**
   * Find a city
   */
  findCity(params: { filter: CityFilter }): Promise<City | null>;
  /**
   * Find cities
   */
  findCities(params: {
    filter: CityFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<City>;
  }): Promise<PaginatedResult<City>>;

  /**
   * Create a government
   */
  create(params: { government: GovernmentCreateInput }): Promise<Government>;
  /**
   * Create a city
   */
  createCity(params: {
    governmentId: IDType;
    city: CityCreateInput;
  }): Promise<City>;

  /**
   * Update a government
   */
  update(params: {
    filter: GovernmentFilter;
    data: GovernmentUpdateInput;
  }): Promise<Government>;

  /**
   * Delete a government
   */
  delete(params: { filter: GovernmentFilter }): Promise<void>;
  /**
   * Delete a city
   */
  deleteCity(params: { filter: CityFilter }): Promise<void>;
}
