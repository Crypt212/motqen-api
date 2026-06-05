import {
  Order,
  OrderCreateInput,
  OrderFilter,
  OrderUpdateInput,
} from '../../domain/order.entity.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';
import { IDType } from './Repository.js';

export default interface IOrderRepository {
  find({ filter }: { filter: OrderFilter }): Promise<Order | null>;
  findMany({
    filter,
    pagination,
    sort,
    includeGlobal
  }: {
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
    includeGlobal?: boolean
  }): Promise<PaginatedResultMeta & { orders: Order[] }>;
  create({ order, imageUrls }: { order: OrderCreateInput; imageUrls: string[] }): Promise<Order>;
  update({ filter, order }: { filter: OrderFilter; order: OrderUpdateInput }): Promise<Order>;
  delete({ filter }: { filter: OrderFilter }): Promise<void>;
  findForProposalAcceptance({ orderId }: { orderId: IDType }): Promise<Order | null>;
  findForWorker({
    workerUserId,
    workerSubSpecializationIds,
    workerWorkingGovernmentIds,
    filter,
    pagination,
    sort,
  }: {
    workerUserId: IDType,
    workerSubSpecializationIds: IDType[],
    workerWorkingGovernmentIds: IDType[],
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
  }): Promise<PaginatedResultMeta & { orders: Order[] }>;
  findForClient({
    clientUserId,
    filter,
    pagination,
    sort,
  }: {
    clientUserId: IDType,
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
  }): Promise<PaginatedResultMeta & { orders: Order[] }>;
}
