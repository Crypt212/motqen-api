import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';


export type SpecializationsWithSubSpecializations =  (Specialization & { subSpecializations: SubSpecialization[] })[];
export type SpecializationsTreeNode = { mainId: IDType; subIds: IDType[] };
export type SpecializationsTree = SpecializationsTreeNode[];

export type Specialization = {
  id: IDType;

  name: string;
  nameAr: string;
  category: SpecializationCategory;
  ordersCount: number;

  updatedAt: Date;
  createdAt: Date;
};

export type SpecializationCreateInput = {
  name: string;
  nameAr: string;
  category: SpecializationCategory;
};

export type SpecializationUpdateInput = Partial<SpecializationCreateInput>;

export type SpecializationFilter = Partial<{
  id: IDType;
  name: string;
  nameAr: string;
  category: SpecializationCategory;
  ordersCount: number;
}>;

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

export type SubSpecializationFilter = Partial<{
  id: IDType;
  mainSpecializationId: IDType;
  name: string;
  nameAr: string;
}>;

// =====================================

export type SpecializationCategory = $Enums.SpecializationCategory;
