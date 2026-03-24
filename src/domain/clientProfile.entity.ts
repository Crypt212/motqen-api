import { IDType } from "../repositories/interfaces/Repository.js";

export interface ClientProfile {
  id: string,
  userId: IDType,

  updatedAt: Date,
  createdAt: Date,
}

export type ClientProfileCreateInput = {
}

export type ClientProfileUpdateInput = Partial<ClientProfileCreateInput>

export type ClientProfileFilter = {
  id?: IDType,
  userId?: IDType
}

// ==================================================

export interface Location {
  id: IDType,
  clientProfileId: IDType,

  governmentId: IDType,
  cityId: IDType,
  address: string,
  addressNotes: string,
  isMain: boolean,
}

export type LocationCreateInput = {
  governmentId: IDType,
  cityId: IDType,
  address: string,
  addressNotes: string,
  isMain: boolean,
}

export type LocationFilter = {
  id?: IDType,
  clientProfileId?: IDType,
}

export type LocationUpdateInput = Partial<LocationCreateInput>
