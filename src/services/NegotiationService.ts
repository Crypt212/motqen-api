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
import OrderRepository from '../repositories/prisma/OrderRepository.js';
import ProposalRepository from '../repositories/prisma/ProposalRepository.js';
import WorkerOccupiedTimeSlotRepository from '../repositories/prisma/WorkerOccupiedTimeSlotRepository.js';

import { PaginatedResultMeta } from '../types/query.js';
import { notificationService } from '../state.js';
import prisma from 'src/libs/database.js';
import IProposalRepository from '../repositories/interfaces/ProposalRepository.js';
import IWorkerOccupiedTimeSlotRepository from '../repositories/interfaces/WorkerOccupiedTimeSlotRepository.js';
import { hasOverlap } from '../utils/overlapCheck.js';
import WorkerProfileRepository from 'src/repositories/prisma/WorkerRepository.js';
import { Order } from 'src/domain/order.entity.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';

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
  private proposalRepository: IProposalRepository;
  private workerOccupiedTimeSlotRepository: IWorkerOccupiedTimeSlotRepository;
  private transactionManager: TransactionManager;

  constructor(params: {
    negotiationRepository: INegotiationRepository;
    proposalRepository: IProposalRepository;
    workerOccupiedTimeSlotRepository: IWorkerOccupiedTimeSlotRepository;
    transactionManager: TransactionManager;
  }) {
    super();
    this.negotiationRepository = params.negotiationRepository;
    this.proposalRepository = params.proposalRepository;
    this.workerOccupiedTimeSlotRepository = params.workerOccupiedTimeSlotRepository;
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
  private async resolveOrderParty(order: OrderForNegotiation, role: "WORKER" | "CLIENT", profileId: IDType): Promise<OrderParty> {
    if (role === 'CLIENT' && profileId !== order.clientProfileId)
      throw new AppError('You are not the owner of this order', 403);

    if (role === 'WORKER') {

      // Direct order but with different worker
      if (order.workerProfileId && profileId !== order.workerProfileId)
        throw new AppError('This order is not assigned to you', 403);

      if (!order.workerProfileId) {
        const proposals = await this.proposalRepository.findMany({ filter: { workerProfileId: profileId, orderId: order.id } });
        if (proposals.proposals.length === 0) {
          throw new AppError('You are not a party to this order', 403);
        }
      }
    }

    return { role, profileId };
  }

  /**
   * Map negotiation direction to the role that created it.
   */
  private directionToRole(direction: string): 'CLIENT' | 'WORKER' {
    return direction === 'CLIENT_TO_WORKER' ? 'CLIENT' : 'WORKER';
  }

  /**
   * Resolves the proposal ID for the negotiation. If not provided, it fetches the single proposal for DIRECT orders.
   */
  private async resolveProposalId(order: OrderForNegotiation, proposalId?: string): Promise<string> {
    if (proposalId) return proposalId;
    if (order.orderMode === 'DIRECT') {
      const { proposals } = await this.proposalRepository.findMany({ filter: { orderId: order.id } });
      if (proposals.length > 0) return proposals[0].id;
      throw new AppError('Proposal not found for direct order', 404);
    }
    throw new AppError('Proposal ID is required for global orders', 400);
  }

  // ─── GET negotiations ─────────────────────────────────────────────────────

  async getNegotiations(params: {
    orderId: string;
    proposalId?: string;
    role: "WORKER" | "CLIENT";
    profileId: IDType;
    pagination?: { page?: number; limit?: number };
  }): Promise<PaginatedResultMeta & { negotiations: Negotiation[] }> {
    const { orderId, proposalId, role, profileId, pagination } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      await this.resolveOrderParty(order, role, profileId);
      const resolvedProposalId = await this.resolveProposalId(order, proposalId);
      return this.negotiationRepository.findByProposalId({ proposalId: resolvedProposalId, pagination });
    });
  }

  // ─── CREATE negotiation ───────────────────────────────────────────────────

  async createNegotiation(params: {
    orderId: string;
    proposalId?: string;
    userId: IDType;
    profileId: IDType;
    role: "WORKER" | "CLIENT";
    price: number;
    startDate?: Date;
    estimatedDurationHours?: number;
    note?: string;
  }): Promise<Negotiation & { hasOverlapWarning?: boolean }> {
    const { orderId, proposalId, userId, role, profileId, price, startDate, estimatedDurationHours, note } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      const party = await this.resolveOrderParty(order, role, profileId);
      const resolvedProposalId = await this.resolveProposalId(order, proposalId);

      // Guard: only allow negotiation in these order states
      if (order.orderStatus !== 'PENDING') {
        throw new AppError(
          'Negotiations are only allowed when order status is PENDING',
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

      const actualStartDate = startDate || (latest?.startDate ?? new Date());
      const actualDuration = estimatedDurationHours || (latest?.estimatedDurationHours ?? 1);

      // Overlap checking
      let hasOverlapWarning = false;
      if (order.workerProfileId) {
        const targetEndDate = new Date(actualStartDate.getTime() + actualDuration * 60 * 60 * 1000);
        const workerSlots = await this.workerOccupiedTimeSlotRepository.findMany({ filter: { workerProfileId: order.workerProfileId, isConfirmed: true } });
        for (const slot of workerSlots) {
          if (hasOverlap(actualStartDate, targetEndDate, slot.startDate, slot.endDate)) {
            hasOverlapWarning = true;
            break;
          }
        }
      }

      const senderId = userId;
      const negotiation = await this.negotiationRepository.create({
        data: {
          orderId,
          proposalId: resolvedProposalId,
          price,
          senderId,
          direction,
          startDate: actualStartDate,
          estimatedDurationHours: actualDuration,
          note
        },
      });

      // Notify the opposing party via socket
      this.notifyOpponent(order, party, 'negotiation_created', negotiation);

      return { ...negotiation, hasOverlapWarning };
    });
  }

  // ─── ACCEPT negotiation ───────────────────────────────────────────────────

  async acceptNegotiation(params: {
    orderId: string;
    proposalId?: string;
    role: "WORKER" | "CLIENT";
    profileId: IDType;
  }): Promise<Order> {
    const { orderId, proposalId, role, profileId } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      const party = await this.resolveOrderParty(order, role, profileId);
      const resolvedProposalId = await this.resolveProposalId(order, proposalId);

      // Guard: only allow negotiation in these order states
      if (order.orderStatus !== 'PENDING') {
        throw new AppError(
          'Negotiations are only allowed when order status is PENDING',
          400
        );
      }

      const latest = await this.negotiationRepository.findLatestByOrderId({ orderId });
      if (!latest || latest.status !== 'PENDING') {
        throw new AppError('No pending negotiation to accept', 400);
      }

      // The requester must NOT be the one who created the offer
      const offerCreator = this.directionToRole(latest.direction);
      if (offerCreator === party.role) {
        throw new AppError('You cannot accept your own offer', 403);
      }

      // Atomic transaction: accept negotiation + update order + dismiss other proposals
      const result = await this.transactionManager.execute(
        {
          negotiationRepo: NegotiationRepository,
          orderRepo: OrderRepository,
          proposalRepo: ProposalRepository,
          workerRepo: WorkerProfileRepository,
          workerTimeSlotRepo: WorkerOccupiedTimeSlotRepository
        },
        async ({ negotiationRepo, orderRepo, proposalRepo, workerRepo, workerTimeSlotRepo }) => {
          // 1. Fetch proposal to get worker details
          const proposal = await proposalRepo.find({ filter: { id: resolvedProposalId } });
          if (!proposal) throw new AppError('Proposal not found', 404);

          // 2. Set negotiation status = ACCEPTED
          await negotiationRepo.updateStatus({ id: latest.id, status: 'ACCEPTED' });

          // 3. Set Proposal status = ACCEPTED
          await proposalRepo.updateStatus({ filter: { id: resolvedProposalId }, status: 'ACCEPTED' });

          // 4. Dismiss all other proposals
          await proposalRepo.bulkDismiss({ filter: { orderId, status: 'PENDING' } });
          await proposalRepo.bulkDismiss({ filter: { orderId, status: 'NEGOTIATING' } });

          // 5. Calculate end date for time slot
          const targetStartDate = latest.startDate || new Date();
          const targetEndDate = new Date(targetStartDate.getTime() + (latest.estimatedDurationHours || 1) * 60 * 60 * 1000);

          // 6. Create worker occupied time slot
          await workerTimeSlotRepo.create({
            slot: {
              workerProfileId: proposal.workerProfileId,
              orderId: orderId,
              startDate: targetStartDate,
              endDate: targetEndDate,
            },
          });

          const workerProfile = await workerRepo.find({ workerFilter: { id: proposal.workerProfileId } });

          // 7. Update order assignment and status
          const orderResult = await orderRepo.update({
            filter: { id: orderId },
            order: {
              workerUserId: workerProfile.userId,
              orderStatus: 'PRICE_AGREED',
              finalPrice: latest.price,
              startDate: targetStartDate,
              estimatedDurationHours: latest.estimatedDurationHours || 1,
            },
          });

          return { updatedOrder: orderResult, workerProfileId: proposal.workerProfileId };
        },
        { isolationLevel: 'Serializable' }
      );

      // Notify the opposing party (socket placeholder)
      this.notifyOpponent(order, party, 'negotiation_accepted', { orderId });

      // Send push notification to client — ORDER_ACCEPTED
      // Resolve the client's userId from the order's clientProfile
      const clientUser = await prisma.clientProfile.findUnique({
        where: { id: order.clientProfileId },
      });

      if (clientUser) {
        notificationService.notify(clientUser.userId, {
          type: 'ORDER_ACCEPTED',
          ctx: {
            orderId: order.id,
            orderTitle: order.title,
          },
        }).catch((err: unknown) => {
          // Fire-and-forget — don't break negotiation flow
        });
      }

      return result.updatedOrder;
    });
  }

  // ─── REJECT negotiation ───────────────────────────────────────────────────

  async rejectNegotiation(params: { orderId: string; proposalId?: string; role: 'WORKER' | 'CLIENT'; profileId: IDType }): Promise<Negotiation> {
    const { orderId, proposalId, role, profileId } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      const party = await this.resolveOrderParty(order, role, profileId);
      const resolvedProposalId = await this.resolveProposalId(order, proposalId);

      // Guard: only allow negotiation in these order states
      if (order.orderStatus !== 'PENDING') {
        throw new AppError(
          'Negotiations are only allowed when order status is PENDING',
          400
        );
      }

      const latest = await this.negotiationRepository.findLatestByProposalId({ proposalId: resolvedProposalId });
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

  // ─── CANCEL negotiation ───────────────────────────────────────────────────

  async cancelNegotiation(params: { orderId: string; proposalId?: string; role: 'WORKER' | 'CLIENT'; profileId: IDType }): Promise<Negotiation> {
    const { orderId, proposalId, role, profileId } = params;
    return tryCatch(async () => {
      const order = await this.getOrderOrThrow(orderId);
      const party = await this.resolveOrderParty(order, role, profileId);
      const resolvedProposalId = await this.resolveProposalId(order, proposalId);

      // Guard: only allow negotiation in these order states
      if (order.orderStatus !== 'PENDING') {
        throw new AppError(
          'Negotiations are only allowed when order status is PENDING',
          400
        );
      }

      const latest = await this.negotiationRepository.findLatestByProposalId({ proposalId: resolvedProposalId });
      if (!latest || latest.status !== 'PENDING') {
        throw new AppError('No pending negotiation to reject', 400);
      }

      // The requester must be the one who created the offer
      const offerCreator = this.directionToRole(latest.direction);
      if (offerCreator !== party.role) {
        throw new AppError('You cannot cancel other party\'s offer', 403);
      }

      const rejected = await this.negotiationRepository.updateStatus({
        id: latest.id,
        status: 'CANCELLED',
      });

      // Notify the opposing party
      this.notifyOpponent(order, party, 'negotiation_cancelled', { orderId });

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
