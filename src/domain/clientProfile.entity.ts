import { FieldTypeDefinition } from '../types/query.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';

export interface ClientProfile {
  id: string;
  userId: IDType;

  updatedAt: Date;
  createdAt: Date;
}

export type ClientProfileCreateInput = {};

export type ClientProfileUpdateInput = Partial<ClientProfileCreateInput>;

export const ClientProfileFilterDescriptor = {
  id: { type: 'uuid' as const },
  userId: { type: 'uuid' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type ClientProfileFilter = FilterFromDescriptor<typeof ClientProfileFilterDescriptor>;
