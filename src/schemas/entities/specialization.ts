import { z } from 'src/libs/zod.js';
import { createFilterMetadata, UUIDSchema } from '../common.js';

export const CategorySchema = z.enum(["ELECTRICITY", "PLUMBING", "AC", "CARPENTRY", "GENERALMAINTENANCE", "PAINTING", "CONSTRUCTION", "CLEANING", "INSTALLATION", "FURNITURETRANSPORT", "DRILLING", "ELECTRICALAPPLIANCES", "DEFAULTCATEGORY"]);

export const SubSpecializationViewSchema = z.object({
  id: UUIDSchema,
  mainSpecializationId: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SubSpecializationFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    mainSpecializationId: UUIDSchema,
    name: z.string(),
    nameAr: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  },
  {
    sortableFields: ['id', 'mainSpecializationId', 'name', 'nameAr', 'createdAt', 'updatedAt'],  // TSort — the actual sortable fields
  }
);


export const SpecializationViewSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  category: CategorySchema,
  ordersCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SpecializationFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    name: z.string(),
    nameAr: z.string(),
    category: CategorySchema,
    ordersCount: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  },
  {
    sortableFields: ['id', 'name', 'nameAr', 'category', 'createdAt', 'updatedAt'],  // TSort — the actual sortable fields
  }
);

export const SpecializationWithSubSpecializationsViewSchema = z.object({
  id: UUIDSchema,
  subSpecializations: z.array(SubSpecializationViewSchema),
  name: z.string(),
  nameAr: z.string(),
  category: CategorySchema,
  ordersCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SpecializationsTreeViewSchema = z.array(z.object({
  mainId: UUIDSchema,
  subIds: z.array(UUIDSchema),
})).min(1, 'specializationsTree must be a non-empty array');

export const SpecializationsTreeDeleteSchema = z.array(z.object({
  mainId: UUIDSchema,
  subIds: z.array(UUIDSchema),
}))

export const SpecializationsTreeCreateSchema = z.array(z.object({
  mainId: UUIDSchema,
  subIds: z.array(UUIDSchema),
})).min(1, 'specializationsTree must be a non-empty array');


export const SpecializationTreeFilterSchema = createFilterMetadata(
  {
    specializationId: UUIDSchema,
    mainId: UUIDSchema,
  },
  {
    sortableFields: ['specializationId', 'mainId'],  // TSort — the actual sortable fields
  }
);

