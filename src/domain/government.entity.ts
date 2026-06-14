import { FieldTypeDefinition } from '../types/query.js';
import { IDType } from '../repositories/interfaces/Repository.js';


export type Government = {
  id: IDType;

  name: string;
  nameAr: string;
  long: number;
  lat: number;

  createdAt: Date;
  updatedAt: Date;
};

export type GovernmentCreateInput = {
  name: string;
  nameAr: string;
  long: number;
  lat: number;
};

export type GovernmentUpdateInput = Partial<GovernmentCreateInput>;

export type GovernmentFilter = Partial<{
  id: IDType;
  name: string;
  nameAr: string;
  long: number;
  lat: number;
}>;

// =======================================

export type City = {
  id: IDType;
  governmentId: IDType;

  name: string;
  nameAr: string;
  long: number;
  lat: number;

  updatedAt: Date;
  createdAt: Date;
};

export type CityCreateInput = {
  name: string;
  nameAr: string;
  long: number;
  lat: number;
};

export type CityUpdateInput = Partial<CityCreateInput>;

export type CityFilter = Partial<{
  id: IDType;
  governmentId: IDType;
  name: string;
  nameAr: string;
  long: number;
  lat: number;
}>;
