import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';
import { City, Government } from './government.entity.js';

export type Location = {
  id: IDType;
  userId: IDType;

  government: Government;
  city: City;
  address: string;
  addressNotes: string;
  long: number;
  lat: number;
  isMain: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LocationCreateInput = {
  governmentId: IDType;
  cityId: IDType;
  address: string;
  addressNotes?: string;
  long: number;
  lat: number;
  isMain: boolean;
};

export type LocationUpdateInput = Partial<LocationCreateInput>;

export const LocationFilterDescriptor = {
  id: { type: 'uuid' as const },
  userId: { type: 'uuid' as const },
  isMain: { type: 'boolean' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type LocationFilter = FilterFromDescriptor<typeof LocationFilterDescriptor>;
