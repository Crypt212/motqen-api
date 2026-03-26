import { FieldTypeDefinition } from '../types/query.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';

export type Government = {
  id: IDType;

  name: string;
  nameAr: string;
  long: string;
  lat: string;

  createdAt: Date;
  updatedAt: Date;
};

export type GovernmentCreateInput = {
  name: string;
  nameAr: string;
  long: string;
  lat: string;
};

export type GovernmentUpdateInput = Partial<GovernmentCreateInput>;

export const GovernmentFilterDescriptor = {
  id: { type: 'uuid' as const },
  name: { type: 'string' as const, minLength: 2, maxLength: 100 },
  nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
  long: { type: 'string' as const, minLength: 2, maxLength: 100 },
  lat: { type: 'string' as const, minLength: 2, maxLength: 100 },
} satisfies Record<string, FieldTypeDefinition>;

export type GovernmentFilter = FilterFromDescriptor<typeof GovernmentFilterDescriptor>;

// =======================================

export type City = {
  id: IDType;
  governmentId: IDType;

  name: string;
  nameAr: string;
  long: string;
  lat: string;

  updatedAt: Date;
  createdAt: Date;
};

export type CityCreateInput = {
  name: string;
  nameAr: string;
  long: string;
  lat: string;
};

export type CityUpdateInput = Partial<CityCreateInput>;

export const CityFilterDescriptor = {
  id: { type: 'uuid' as const },
  name: { type: 'string' as const, minLength: 2, maxLength: 100 },
  nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
  long: { type: 'string' as const, minLength: 2, maxLength: 100 },
  lat: { type: 'string' as const, minLength: 2, maxLength: 100 },
} satisfies Record<string, FieldTypeDefinition>;

export type CityFilter = FilterFromDescriptor<typeof CityFilterDescriptor>;
