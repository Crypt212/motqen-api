import { IDType } from '../repositories/interfaces/Repository.js';

export interface ClientProfile {
  id: IDType;
  userId: IDType;

  updatedAt: Date;
  createdAt: Date;
}

export type ClientProfileCreateInput = {};

export type ClientProfileUpdateInput = Partial<ClientProfileCreateInput>;

export type ClientProfileFilter = Partial<{
  id: IDType;
  userId: IDType;

  updatedAt: Date;
  createdAt: Date;
}>;
