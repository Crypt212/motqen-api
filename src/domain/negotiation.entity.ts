import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';

export type NegotiationDirection = $Enums.NegotiationDirection;
export type NegotiationStatus = $Enums.NegotiationStatus;

export type Negotiation = {
  id: IDType;
  orderId: IDType;
  proposalId: IDType;
  direction: NegotiationDirection;
  startDate: Date;
  estimatedDurationHours: number;
  price: number;
  status: NegotiationStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateNegotiationInput = {
  orderId: IDType;
  senderId: IDType;
  proposalId: IDType;
  direction: NegotiationDirection;
  startDate: Date;
  estimatedDurationHours: number;
  price: number;
  note?: string;
};

/**
 * Lightweight order projection used only for negotiation auth + business checks.
 * Not a full Order entity — that will be defined when the Orders module is built.
 */
export type OrderForNegotiation = {
  id: IDType;
  clientProfileId: IDType;
  workerProfileId: IDType | null;
  orderStatus: $Enums.OrderStatus;
  title: string;
  orderMode: $Enums.OrderMode;
};
