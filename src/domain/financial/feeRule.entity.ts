import { IDType } from '../../repositories/interfaces/Repository.js';

export type FeeRule = {
  id: IDType;
  percentage: number;
  effectiveFrom: Date;
  isActive: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FeeRuleCreateInput = {
  percentage: number;
  effectiveFrom?: Date;
  isActive?: boolean;
  description?: string;
};
