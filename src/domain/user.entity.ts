import { $Enums } from "@prisma/client";
import { IDType } from "../repositories/interfaces/Repository.js";

export type AccountStatus = $Enums.AccountStatus;

export type Role = $Enums.Role;


export type User = {
  id: IDType,

  phoneNumber: string,
  firstName: string,
  middleName: string,
  lastName: string,
  profileImageUrl: string,
  status: AccountStatus,
  role: Role,

  isOnline: boolean,
  isWorker?: boolean,
  isClient?: boolean,

  createdAt: Date,
  updatedAt: Date,
}


export type UserCreateInput = {
  phoneNumber: string,
  firstName: string,
  middleName: string,
  lastName: string,
  profileImageUrl?: string,
  status: AccountStatus,
  role: Role,
}

export type UserUpdateInput = Partial<UserCreateInput>;

export type UsersFilter = {
  id?: IDType,
  phoneNumber?: string,
}

