import { $Enums } from '../generated/prisma/client.js';
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
  lastNotificationReadAt?: Date | null;
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

export type UserUpdateInput = Partial<UserCreateInput> & { lastNotificationReadAt?: Date | null };

export const UserFilterDescriptor = {
  id: { type: 'uuid' as const },
  phoneNumber: { type: 'string' as const, searchable: true },
  firstName: { type: 'string' as const, searchable: true },
  middleName: { type: 'string' as const, searchable: true },
  lastName: { type: 'string' as const, searchable: true },
  status: {
    type: 'enum' as const,
    enumValues: Object.values($Enums.AccountStatus) as [string, ...string[]],
    sortable: true,
  },
  role: {
    type: 'enum' as const,
    enumValues: Object.values($Enums.Role) as [string, ...string[]],
    sortable: true,
  },
  isOnline: { type: 'boolean' as const },
  createdAt: { type: 'date' as const, sortable: true },
} satisfies Record<string, FieldTypeDefinition>;

export type UserFilter = FilterFromDescriptor<typeof UserFilterDescriptor>;
