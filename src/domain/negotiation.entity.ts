import { $Enums } from '../generated/prisma/client.js';

export type NegotiationDirection = $Enums.NegotiationDirection;
export type NegotiationStatus = $Enums.NegotiationStatus;

export type Negotiation = {
  id: string;
  orderId: string;
  price: number;
  direction: NegotiationDirection;
  status: NegotiationStatus;
  senderId: string;
  acceptedBy: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NegotiationCreateInput = {
  orderId: string;
  price: number;
  direction: NegotiationDirection;
  senderId: string;
  note?: string;
};

export type NegotiationUpdateInput = Partial<{
  status: NegotiationStatus;
  acceptedBy: string;
}>;

export type NegotiationFilter = {
  id?: string;
  orderId?: string;
  senderId?: string;
  status?: NegotiationStatus;
};
