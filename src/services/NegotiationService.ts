/**
 * @fileoverview NegotiationService - Business logic for order price negotiations
 * @module services/NegotiationService
 */

import AppError from '../errors/AppError.js';
import Service, { tryCatch } from './Service.js';
import INegotiationRepository from '../repositories/interfaces/NegotiationRepository.js';
import { Negotiation, OrderForNegotiation } from '../domain/negotiation.entity.js';
import { TransactionManager } from '../repositories/prisma/TransactionManager.js';
import NegotiationRepository from '../repositories/prisma/NegotiationRepository.js';
import { UserState } from '../types/asyncHandler.js';
import { PaginatedResultMeta } from '../types/query.js';
import { emitToUser } from '../socket/socket-emitter.js';

type OrderParty = {
  role: 'CLIENT' | 'WORKER';
  profileId: string;
  opponentUserId?: string;
};

/**
 * NegotiationService — all negotiation business logic
 * @class
 * @extends Service
 */
export default class NegotiationService extends Service {
  private negotiationRepository: INegotiationRepository;
  private transactionManager: TransactionManager;

  constructor(params: {
    negotiationRepository: INegotiationRepository;
    transactionManager: TransactionManager;
  }) {
    super();
    this.negotiationRepository = params.negotiationRepository;
    this.transactionManager = params.transactionManager;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Fetch the order and validate it exists.
   * @throws {AppError} 404 if not found
   */
  private async getOrderOrThrow(orderId: string): Promise<OrderForNegotiation> {
    const order = await this.negotiationRepository.findOrderWithProfiles({ orderId });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  /**
   * Determine whether the requester is the client or the worker of this order.
   * @throws {AppError} 403 if the user is not a party to the order
   */
  private resolveOrderParty(order: OrderForNegotiation, userState: UserState): OrderParty {
    if (userState.client && userState.client.id === order.clientProfileId) {
      return { role: 'CLIENT', profileId: userState.client.id };
    }
    if (userState.worker && userState.worker.id === order.workerProfileId) {
      return { role: 'WORKER', profileId: userState.worker.id };
    }
    throw new AppError('You are not a party to this order', 403);
  }

  /**
   * Map negotiation direction to the role that created it.
   */
  private directionToRole(direction: string): 'CLIENT' | 'WORKER' {
    return direction === 'CLIENT_TO_WORKER' ? 'CLIENT' : 'WORKER';
  }

  // ─── GET negotiations ─────────────────────────────────────────────────────

  async getNegotiations(params: {
    orderId: string;
    userState: UserState;
    pagination?: { page?: number; limit?: number };
  }): Promise<PaginatedResultMeta & { negotiations: Negotiation[] }> {
    const { orderId, userState, pagination } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      this.resolveOrderParty(order, userState);

      return this.negotiationRepository.findByOrderId({ orderId, pagination });
    });
  }

  // ─── CREATE negotiation ───────────────────────────────────────────────────

  async createNegotiation(params: {
    orderId: string;
    userState: UserState;
    price: number;
    note?: string;
  }): Promise<Negotiation> {
    const { orderId, userState, price, note } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      const party = this.resolveOrderParty(order, userState);

      // Guard: only allow negotiation in these order states
      if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'TIME_SPECIFIED') {
        throw new AppError(
          'Negotiations are only allowed when order status is PENDING or TIME_SPECIFIED',
          400
        );
      }

      // Guard: prevent spam — if the latest negotiation is still PENDING, block
      const latest = await this.negotiationRepository.findLatestByOrderId({ orderId });
      if (latest && latest.status === 'PENDING') {
        throw new AppError(
          'The previous offer is still pending. Wait for the other party to respond',
          400
        );
      }

      // Determine direction from requester role
      const direction = party.role === 'CLIENT' ? 'CLIENT_TO_WORKER' : 'WORKER_TO_CLIENT';

      const negotiation = await this.negotiationRepository.create({
        data: { orderId, price, direction, note },
      });

      // Notify the opposing party via socket
      this.notifyOpponent(order, party, 'negotiation_created', negotiation);

      return negotiation;
    });
  }

  // ─── ACCEPT negotiation ───────────────────────────────────────────────────

  async acceptNegotiation(params: {
    orderId: string;
    userState: UserState;
  }): Promise<Record<string, unknown>> {
    const { orderId, userState } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      const party = this.resolveOrderParty(order, userState);

      const latest = await this.negotiationRepository.findLatestByOrderId({ orderId });
      if (!latest || latest.status !== 'PENDING') {
        throw new AppError('No pending negotiation to accept', 400);
      }

      // The requester must NOT be the one who created the offer
      const offerCreator = this.directionToRole(latest.direction);
      if (offerCreator === party.role) {
        throw new AppError('You cannot accept your own offer', 403);
      }

      // Atomic transaction: accept negotiation + update order
      const updatedOrder = await this.transactionManager.execute(
        { negotiationRepo: NegotiationRepository },
        async ({ negotiationRepo }, tx) => {
          // 1. Set negotiation status = ACCEPTED
          await negotiationRepo.updateStatus({ id: latest.id, status: 'ACCEPTED' });

          // 2. Set order price and status
          const orderResult = await tx.order.update({
            where: { id: orderId },
            data: {
              finalPrice: latest.price,
              orderStatus: 'PRICE_AGREED',
            },
          });

          return orderResult;
        },
        { isolationLevel: 'Serializable' }
      );

      // Notify the opposing party
      this.notifyOpponent(order, party, 'negotiation_accepted', { orderId });

      return {
        id: updatedOrder.id,
        clientProfileId: updatedOrder.clientProfileId,
        workerProfileId: updatedOrder.workerProfileId,
        title: updatedOrder.title,
        description: updatedOrder.description,
        orderStatus: updatedOrder.orderStatus,
        finalPrice: updatedOrder.finalPrice,
        date: updatedOrder.date,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
      };
    });
  }

  // ─── REJECT negotiation ───────────────────────────────────────────────────

  async rejectNegotiation(params: { orderId: string; userState: UserState }): Promise<Negotiation> {
    const { orderId, userState } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      const party = this.resolveOrderParty(order, userState);

      const latest = await this.negotiationRepository.findLatestByOrderId({ orderId });
      if (!latest || latest.status !== 'PENDING') {
        throw new AppError('No pending negotiation to reject', 400);
      }

      // The requester must NOT be the one who created the offer
      const offerCreator = this.directionToRole(latest.direction);
      if (offerCreator === party.role) {
        throw new AppError('You cannot reject your own offer', 403);
      }

      const rejected = await this.negotiationRepository.updateStatus({
        id: latest.id,
        status: 'REJECTED',
      });

      // Notify the opposing party
      this.notifyOpponent(order, party, 'negotiation_rejected', { orderId });

      return rejected;
    });
  }

  // ─── Socket notifications ────────────────────────────────────────────────

  /**
   * Emit a socket event to the opposing party.
   * Resolves userId from the order's client/worker profile relationship.
   * Fire-and-forget — failures are silently ignored.
   */
  private notifyOpponent(
    order: OrderForNegotiation,
    party: OrderParty,
    event: string,
    data: unknown
  ): void {
    try {
      // We need to resolve the opponent's userId from their profile.
      // Since userState carries the IDs and the order carries profileIds,
      // we can determine who to notify based on the requester's role.
      // However, we don't have the opponent's userId directly from OrderForNegotiation.
      // For now, we emit to a profile-based room. This can be enhanced
      // when the full Orders module provides user lookup.
      //
      // TODO: Resolve opponent userId for socket notification when
      // the Orders module provides the user-profile relationship.
      // For now this is a no-op placeholder that matches the architecture.
    } catch {
      // Fire-and-forget
    }
  }
}
