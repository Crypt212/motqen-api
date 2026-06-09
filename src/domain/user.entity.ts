import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';

export type AccountStatus = $Enums.AccountStatus;

export type User = {
  id: IDType;

  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImageUrl: string | null;
  status: AccountStatus;

  isOnline: boolean;

  createdAt: Date;
  updatedAt: Date;
  lastNotificationReadAt?: Date | null;
};

export type LoggedInUser = User & {
  isWorker: boolean;
  isClient: boolean;
};

export type UserCreateInput = {
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImageUrl?: string;
  status: AccountStatus;
};

export type UserUpdateInput = Partial<UserCreateInput> & { lastNotificationReadAt?: Date | null };

export const UserFilterDescriptor = {
  id: { type: 'uuid' as const },
  phoneNumber: { type: 'string' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type UserFilter = FilterFromDescriptor<typeof UserFilterDescriptor>;
