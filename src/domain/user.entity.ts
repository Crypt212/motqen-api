import { $Enums } from '@prisma/client';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';

export type AccountStatus = $Enums.AccountStatus;

export type Role = $Enums.Role;

export type User = {
  id: IDType;

  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImageUrl: string;
  status: AccountStatus;
  role: Role;

  isOnline: boolean;

  createdAt: Date;
  updatedAt: Date;
};

export type UserCreateInput = {
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImageUrl?: string;
  status: AccountStatus;
  role: Role;
};

export type UserUpdateInput = Partial<UserCreateInput>;

export const UserFilterDescriptor = {
  id: { type: 'uuid' as const },
  phoneNumber: { type: 'string' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type UserFilter = FilterFromDescriptor<typeof UserFilterDescriptor>;
