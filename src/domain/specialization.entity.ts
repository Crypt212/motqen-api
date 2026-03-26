import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FieldTypeDefinition } from '../types/query.js';
import { FilterFromDescriptor } from '../schemas/common.js';

export type SpecializationsTreeNode = { mainId: IDType; subIds: IDType[] };
export type SpecializationsTree = SpecializationsTreeNode[];

export type Specialization = {
  id: IDType;

  name: string;
  nameAr: string;
  category: SpecializationCategory;

  updatedAt: Date;
  createdAt: Date;
};

export type SpecializationCreateInput = {
  name: string;
  nameAr: string;
  category: SpecializationCategory;
};

export type SpecializationUpdateInput = Partial<SpecializationCreateInput>;

export const SpecializationFilterDescriptor = {
  id: { type: 'uuid' as const },
  name: { type: 'string' as const },
  nameAr: { type: 'string' as const },
  category: { type: 'string' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type SpecializationFilter = FilterFromDescriptor<typeof SpecializationFilterDescriptor> & {
  category?: SpecializationCategory;
};

// =====================================

export type SubSpecialization = {
  id: IDType;
  mainSpecializationId: IDType;

  name: string;
  nameAr: string;

  updatedAt: Date;
  createdAt: Date;
};

export type SubSpecializationCreateInput = {
  name: string;
  nameAr: string;
};

export type SubSpecializationUpdateInput = Partial<SubSpecializationCreateInput>;

export const SubSpecializationFilterDescriptor = {
  id: { type: 'uuid' as const },
  mainSpecializationId: { type: 'uuid' as const },
  name: { type: 'string' as const },
  nameAr: { type: 'string' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type SubSpecializationFilter = FilterFromDescriptor<
  typeof SubSpecializationFilterDescriptor
>;

// =====================================

export type SpecializationCategory = $Enums.SpecializationCategory;
