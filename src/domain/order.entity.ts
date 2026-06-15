import { IDType } from 'src/repositories/interfaces/Repository.js';
import { $Enums } from '../generated/prisma/client.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';
import { SubSpecialization } from './specialization.entity.js';

export type OrderStatus = $Enums.OrderStatus;
export type WorkStatus = $Enums.WorkStatus;
export type OrderMode = $Enums.OrderMode;

export type Order = {
  id: IDType;
  referenceNumber: number;
  orderReference: string;
  title: string;
  description: string;
  clientUserId: IDType;
  workerUserId: IDType | null;
  locationId: IDType;
  subSpecialization: SubSpecialization;
  orderStatus: OrderStatus;
  workStatus: WorkStatus;
  initialPrice: number | null;
  finalPrice: number | null;
  startDate: Date | null;
  estimatedDurationHours: number | null;
  isUrgent: boolean;
  rate: number;
  comment: string | null;
  workStartedAt: Date | null;
  workFinishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  orderMode: OrderMode;
  clientName?: string;
  workerName?: string | null;
  client?: any;
  craftsman?: any;
  disputeExists?: boolean;
  reportExists?: boolean;
};

export type OrderCreateInput = {
  title: string;
  description: string;
  clientUserId: IDType;
  workerUserId?: IDType | null;
  locationId: IDType;
  subSpecializationId: IDType;
  initialPrice: number;
  startDate?: Date | null;
  estimatedDurationHours: number;
  isUrgent: boolean;
  orderMode?: OrderMode;
};

export type OrderUpdateInput = Partial<{
  orderStatus: OrderStatus;
  workStatus: WorkStatus;
  finalPrice: number;
  startDate: Date;
  estimatedDurationHours: number;
  rate: number;
  comment: string;
  workStartedAt: Date;
  workFinishedAt: Date;
  workerUserId: IDType | null;
}>;

export const OrderFilterDescriptor = {
  id: { type: 'uuid' },
  clientUserId: { type: 'uuid' },
  workerUserId: { type: 'uuid' },
  rate: { type: 'number' },
  orderStatus: {
    type: 'enum',
    enumValues: ['PENDING', 'OPEN', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED'],
  },
  orderMode: {
    type: 'enum',
    enumValues: ['DIRECT', 'GLOBAL'],
  },
  isUrgent: { type: 'boolean' },
  orderReference: { type: 'string', searchable: true },
  clientName: { type: 'string', searchable: true },
  workerName: { type: 'string', searchable: true },
  governmentId: { type: 'uuid' },
  specializationId: { type: 'uuid' },
  createdFrom: { type: 'date' },
  createdTo: { type: 'date' },
  createdAt: { type: 'date', sortable: true },
} satisfies Record<string, FieldTypeDefinition>;

export type OrderFilter = FilterFromDescriptor<typeof OrderFilterDescriptor>;
