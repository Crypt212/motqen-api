import { IDType } from 'src/repositories/interfaces/Repository.js';
import { $Enums } from '../generated/prisma/client.js';

import { FieldTypeDefinition } from '../types/query.js';
import { SubSpecialization } from './specialization.entity.js';

export type OrderStatus = $Enums.OrderStatus;
export type WorkStatus = $Enums.WorkStatus;
export type OrderMode = $Enums.OrderMode;

export type Order = {
  id: IDType;
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

export type OrderFilter = Partial<{
  id: IDType;
  clientUserId: IDType;
  workerUserId: IDType;
  rate: number;
  orderStatus: OrderStatus;
  orderMode: OrderMode;
  isUrgent: boolean;
  createdAt: Date;
}>;
