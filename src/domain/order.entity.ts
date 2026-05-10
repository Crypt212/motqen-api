import { IDType } from 'src/repositories/interfaces/Repository.js';
import { $Enums } from '../generated/prisma/client.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';
import { SubSpecialization } from './specialization.entity.js';

export type OrderStatus = $Enums.OrderStatus;
export type WorkStatus = $Enums.WorkStatus;

export type Order = {
  id: IDType;
  title: string;
  description: string;
  clientUserId: IDType;
  workerUserId: IDType;
  locationId: IDType;
  subSpecialization: SubSpecialization;
  orderStatus: OrderStatus;
  workStatus: WorkStatus;
  finalPrice: number | null;
  startDate: Date;
  endDate: Date | null;
  isUrgent: boolean;
  rate: number;
  comment?: string;
  workStartedAt: Date | null;
  workFinishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
};

export type OrderCreateInput = {
  title: string;
  description: string;
  clientUserId: IDType;
  workerUserId: IDType;
  locationId: IDType;
  subSpecializationId: IDType;
  startDate: Date;
  isUrgent: boolean;
};

export type OrderUpdateInput = Partial<{
  orderStatus: OrderStatus;
  workStatus: WorkStatus;
  finalPrice: number;
  endDate: Date;
  rate: number;
  comment: string;
  workStartedAt: Date;
  workFinishedAt: Date;
}>;

export const OrderFilterDescriptor = {
  id: { type: 'uuid' },
  clientUserId: { type: 'uuid' },
  workerUserId: { type: 'uuid' },
  rate: { type: 'number' },
  orderStatus: {
    type: 'enum',
    enumValues: ['PENDING', 'TIME_SPECIFIED', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED'],
  },
  isUrgent: { type: 'boolean' },
  createdAt: { type: 'date', sortable: true },
} satisfies Record<string, FieldTypeDefinition>;

export type OrderFilter = FilterFromDescriptor<typeof OrderFilterDescriptor>;
