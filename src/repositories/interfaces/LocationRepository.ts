import {
  Location,
  LocationCreateInput,
  LocationFilter,
  LocationUpdateInput,
} from '../../domain/location.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';

export default interface ILocationRepository {
  exists({ filter }: { filter: LocationFilter }): Promise<boolean>;
  isConnectedToOrder({ locationId }: { locationId: string }): Promise<boolean>;
  count({ filter }: { filter: LocationFilter }): Promise<number>;
  find({ filter }: { filter: LocationFilter }): Promise<Location | null>;
  findMany({
    filter,
    pagination,
    sort,
  }: {
    filter: LocationFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Location>;
  }): Promise<PaginatedResultMeta & { locations: Location[] }>;
  create({ location }: { location: LocationCreateInput & { userId: string } }): Promise<Location>;
  update({
    filter,
    location,
  }: {
    filter: LocationFilter;
    location: LocationUpdateInput;
  }): Promise<Location>;
  delete({ filter }: { filter: LocationFilter }): Promise<void>;
  setAllNonMain({ userId }: { userId: string }): Promise<void>;
  findNextForPromotion({
    userId,
    excludeId,
  }: {
    userId: string;
    excludeId: string;
  }): Promise<Location | null>;
}
