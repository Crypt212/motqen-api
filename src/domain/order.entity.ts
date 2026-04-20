import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';

export type OrderStatus = $Enums.OrderStatus;
export type WorkStatus = $Enums.WorkStatus;

export type Order = {
  id: string;
  title: string;
  description: string;
  clientProfileId: string;
  workerProfileId: string | null;
  locationId: string;
  subSpecializationId: string;
  orderStatus: OrderStatus;
  workStatus: WorkStatus;
  finalPrice: number | null;
  startDate: Date;
  endDate: Date | null;
  isUrgent: boolean;
  workStartedAt: Date | null;
  workFinishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
};

export type OrderCreateInput = {
  title: string;
  description: string;
  clientProfileId: string;
  locationId: string;
  subSpecializationId: string;
  startDate: Date;
  isUrgent: boolean;
};

export type OrderUpdateInput = Partial<{
  orderStatus: OrderStatus;
  workStatus: WorkStatus;
  finalPrice: number;
  endDate: Date;
  workerProfileId: string;
  workStartedAt: Date;
  workFinishedAt: Date;
}>;

export const OrderFilterDescriptor: Record<string, FieldTypeDefinition> = {
  id: { type: 'uuid' },
  clientProfileId: { type: 'uuid' },
  workerProfileId: { type: 'uuid' },
  orderStatus: {
    type: 'enum',
    enumValues: ['PENDING', 'TIME_SPECIFIED', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED'],
  },
  isUrgent: { type: 'boolean' },
  createdAt: { type: 'date', sortable: true },
};

export type OrderFilter = FilterFromDescriptor<typeof OrderFilterDescriptor>;
