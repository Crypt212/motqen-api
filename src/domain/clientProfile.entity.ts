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

// ==================================================

export interface Location {
  id: IDType;
  clientProfileId: IDType;

  governmentId: IDType;
  cityId: IDType;
  address: string;
  addressNotes: string;
  isMain: boolean;
}

export type LocationCreateInput = {
  governmentId: IDType;
  cityId: IDType;
  address: string;
  addressNotes: string;
  isMain: boolean;
};

export const LocationFilterDescriptor = {
  id: { type: 'uuid' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type LocationFilter = FilterFromDescriptor<typeof LocationFilterDescriptor>;

export type LocationUpdateInput = Partial<LocationCreateInput>;
