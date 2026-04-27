import { IDType } from './Repository.js';
import {
  Negotiation,
  NegotiationStatus,
  CreateNegotiationInput,
  OrderForNegotiation,
} from '../../domain/negotiation.entity.js';
import { PaginatedResultMeta } from '../../types/query.js';

export default interface INegotiationRepository {
  /**
   * Find all negotiations for an order, sorted by createdAt DESC.
   */
  findByOrderId(params: {
    orderId: IDType;
    pagination?: { page?: number; limit?: number };
  }): Promise<PaginatedResultMeta & { negotiations: Negotiation[] }>;

  /**
   * Find the most recent negotiation for an order (by createdAt DESC).
   */
  findLatestByOrderId(params: { orderId: IDType }): Promise<Negotiation | null>;

  /**
   * Create a new negotiation record.
   */
  create(params: { data: CreateNegotiationInput }): Promise<Negotiation>;

  /**
   * Update the status of a negotiation.
   */
  updateStatus(params: { id: IDType; status: NegotiationStatus }): Promise<Negotiation>;

  /**
   * Lightweight order lookup — returns only the fields needed for
   * negotiation authorization and business checks.
   */
  findOrderWithProfiles(params: { orderId: IDType }): Promise<OrderForNegotiation | null>;
}
