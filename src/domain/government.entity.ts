import { FieldTypeDefinition } from '../types/query.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';

export type Government = {
  id: IDType;

  name: string;
  nameAr: string;
  long: number;
  lat: number;

  createdAt: Date;
  updatedAt: Date;
};

export type GovernmentCreateInput = {
  name: string;
  nameAr: string;
  long: number;
  lat: number;
};

export type GovernmentUpdateInput = Partial<GovernmentCreateInput>;

export const GovernmentFilterDescriptor = {
  id: { type: 'uuid' as const },
  name: { type: 'string' as const, minLength: 2, maxLength: 100 },
  nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
  long: { type: 'number' as const },
  lat: { type: 'number' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type GovernmentFilter = FilterFromDescriptor<typeof GovernmentFilterDescriptor>;

// =======================================

export type City = {
  id: IDType;
  governmentId: IDType;

  name: string;
  nameAr: string;
  long: number;
  lat: number;

  updatedAt: Date;
  createdAt: Date;
};

export type CityCreateInput = {
  name: string;
  nameAr: string;
  long: number;
  lat: number;
};

export type CityUpdateInput = Partial<CityCreateInput>;

export const CityFilterDescriptor = {
  id: { type: 'uuid' as const },
  name: { type: 'string' as const, minLength: 2, maxLength: 100 },
  nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
  long: { type: 'number' as const },
  lat: { type: 'number' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type CityFilter = FilterFromDescriptor<typeof CityFilterDescriptor>;
