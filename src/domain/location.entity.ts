import { IDType } from '../repositories/interfaces/Repository.js';

import { FieldTypeDefinition } from '../types/query.js';
import { City, Government } from './government.entity.js';

export type Location = {
  id: IDType;
  userId: IDType;

  government: Government;
  city: City;
  address: string;
  addressNotes: string;
  long: number;
  lat: number;
  isMain: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LocationCreateInput = {
  governmentId: IDType;
  cityId: IDType;
  address: string;
  addressNotes?: string;
  long: number;
  lat: number;
  isMain: boolean;
  isHidden?: boolean;
};

export type LocationUpdateInput = Partial<LocationCreateInput>;

export type LocationFilter = Partial<{
  id: IDType;
  userId: IDType;
  isMain: boolean;
  isHidden: boolean;
}>;
