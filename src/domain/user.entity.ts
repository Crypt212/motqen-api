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

// ==================================================
// Location — belongs to User (not ClientProfile)
// ==================================================

export interface Location {
  id: IDType;
  userId: IDType;

  governmentId: IDType;
  cityId: IDType;
  address: string;
  addressNotes: string;
  long: number;
  lat: number;
  isMain: boolean;
}

export type LocationCreateInput = {
  governmentId: IDType;
  cityId: IDType;
  address: string;
  addressNotes: string;
  long: number;
  lat: number;
  isMain: boolean;
};

export type LocationUpdateInput = Partial<LocationCreateInput>;
