import {
  Order,
  OrderCreateInput,
  OrderFilter,
  OrderUpdateInput,
} from '../../domain/order.entity.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';

export default interface IOrderRepository {
  find({ filter }: { filter: OrderFilter }): Promise<Order | null>;
  findMany({
    filter,
    pagination,
    sort,
  }: {
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
  }): Promise<PaginatedResultMeta & { orders: Order[] }>;
  create({ order, imageUrls }: { order: OrderCreateInput; imageUrls: string[] }): Promise<Order>;
  update({ filter, order }: { filter: OrderFilter; order: OrderUpdateInput }): Promise<Order>;
  delete({ filter }: { filter: OrderFilter }): Promise<void>;
}
