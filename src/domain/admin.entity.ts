import { FieldTypeDefinition } from '../types/query.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { IDType } from '../repositories/interfaces/Repository.js';

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'USER_MANAGEMENT'
  | 'FINANCIAL_MONITOR'
  | 'ISSUES_MANAGEMENT';
export type AdminStatus = 'ACTIVE' | 'DISABLED';

export type Admin = {
  id: IDType;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: AdminRole;
  status: AdminStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminCreateInput = Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>;
export type AdminUpdateInput = Partial<Omit<AdminCreateInput, 'passwordHash'>> & {
  passwordHash?: string;
};

export const AdminFilterDescriptor = {
  id: { type: 'uuid' as const },
  username: { type: 'string' as const },
  role: { type: 'string' as const },
  status: { type: 'string' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type AdminFilter = FilterFromDescriptor<typeof AdminFilterDescriptor>;
