import Service, { tryCatch } from './Service.js';
import INegotiationRepository from '../repositories/interfaces/NegotiationRepository.js';
import IWorkerOccupiedTimeSlotRepository from '../repositories/interfaces/WorkerOccupiedTimeSlotRepository.js';
import IOrderRepository from '../repositories/interfaces/OrderRepository.js';
import AppError from '../errors/AppError.js';
import { hasOverlap } from '../utils/overlapCheck.js';
import { Negotiation, NegotiationDirection } from '../domain/negotiation.entity.js';

interface NegotiationServiceDeps {
  negotiationRepository: INegotiationRepository;
  orderRepository: IOrderRepository;
  occupiedTimeSlotRepository: IWorkerOccupiedTimeSlotRepository;
}

export default class NegotiationService extends Service {
  private negotiationRepository: INegotiationRepository;
  private orderRepository: IOrderRepository;
  private occupiedTimeSlotRepository: IWorkerOccupiedTimeSlotRepository;

  constructor(deps: NegotiationServiceDeps) {
    super();
    this.negotiationRepository = deps.negotiationRepository;
    this.orderRepository = deps.orderRepository;
    this.occupiedTimeSlotRepository = deps.occupiedTimeSlotRepository;
  }

  async createNegotiation(params: {
    orderId: string;
    price: number;
    direction: NegotiationDirection;
    senderId: string;
    note?: string;
  }): Promise<Negotiation> {
    return tryCatch(async () => {
      const { orderId, price, direction, senderId, note } = params;

      const order = await this.orderRepository.find({ filter: { id: orderId } });
      if (!order) throw new AppError('Order not found', 404);

      return await this.negotiationRepository.create({
        negotiation: { orderId, price, direction, senderId, note },
      });
    });
  }

  async acceptNegotiation(params: {
    negotiationId: string;
    acceptedByUserId: string;
    workerProfileId?: string;
  }): Promise<Negotiation> {
    return tryCatch(async () => {
      const { negotiationId, acceptedByUserId, workerProfileId } = params;

      const negotiation = await this.negotiationRepository.find({
        filter: { id: negotiationId },
      });
      if (!negotiation) throw new AppError('Negotiation not found', 404);

      if (negotiation.status !== 'PENDING') {
        throw new AppError('Negotiation is no longer pending', 400);
      }

      const order = await this.orderRepository.find({ filter: { id: negotiation.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      // Check worker availability if the order has a defined time range
      if (workerProfileId && order.startDate && order.endDate) {
        const existingSlots = await this.occupiedTimeSlotRepository.findMany({
          filter: { workerProfileId },
        });

        for (const slot of existingSlots) {
          if (hasOverlap(order.startDate, order.endDate, slot.startDate, slot.endDate)) {
            throw new AppError('Worker is not available during the order time range', 409);
          }
        }
      }

      return await this.negotiationRepository.update({
        filter: { id: negotiationId },
        negotiation: { status: 'ACCEPTED', acceptedBy: acceptedByUserId },
      });
    });
  }

  async getNegotiationsByOrder(params: { orderId: string }): Promise<Negotiation[]> {
    return tryCatch(async () => {
      return await this.negotiationRepository.findMany({ filter: { orderId: params.orderId } });
    });
  }

  async rejectNegotiation(params: { negotiationId: string }): Promise<Negotiation> {
    return tryCatch(async () => {
      const negotiation = await this.negotiationRepository.find({
        filter: { id: params.negotiationId },
      });
      if (!negotiation) throw new AppError('Negotiation not found', 404);

      if (negotiation.status !== 'PENDING') {
        throw new AppError('Negotiation is no longer pending', 400);
      }

      return await this.negotiationRepository.update({
        filter: { id: params.negotiationId },
        negotiation: { status: 'REJECTED' },
      });
    });
  }
}
