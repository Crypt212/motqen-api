import { IDType } from "../repositories/interfaces/Repository.js";

export type Government = {
  id: IDType;

  name: string;
  nameAr: string;
  long: string;
  lat: string;

  createdAt: Date;
  updatedAt: Date;
};

export type GovernmentCreateInput = {
  name: string;
  nameAr: string;
  long: string;
  lat: string;
};

export type GovernmentUpdateInput = Partial<GovernmentCreateInput>;

export type GovernmentFilter = {
  id?: IDType,
}

// =======================================

export type City = {
  id: IDType,
  governmentId: IDType,

  name: string,
  nameAr: string,
  long: string,
  lat: string,

  updatedAt: Date,
  createdAt: Date,
}

export type CityCreateInput = {
  name: string,
  nameAr: string,
  long: string,
  lat: string,
}

export type CityUpdateInput = Partial<CityCreateInput>;

export type CityFilter = {
  id?: IDType,
  governmentId?: IDType,
}

