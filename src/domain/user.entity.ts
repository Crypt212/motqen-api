import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';

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
  clientProfileId: IDType;
  workerProfileId: IDType;
};

export type UserCreateInput = {
  phoneNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImageUrl?: string;
  status: AccountStatus;
};

export type UserUpdateInput = Partial<UserCreateInput> & { lastNotificationReadAt?: Date | null; isOnline?: boolean };

export type UserFilter = Partial<{
  id: IDType;
  phoneNumber: string;
}>;

