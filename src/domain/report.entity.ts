import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';

import { FieldTypeDefinition } from '../types/query.js';

export type ReportTargetType = $Enums.ReportTargetType;
export type ReportStatus = $Enums.ReportStatus;
export type ProblemCategory = $Enums.ProblemCategory;
export type ProblemType = $Enums.ProblemType;

export type Report = {
  id: IDType;
  reporterId: IDType;
  targetType: ReportTargetType;
  targetId: IDType | null;
  contextOrderId: IDType | null;
  conversationId: IDType | null;
  problemCategory: ProblemCategory;
  problemType: ProblemType;
  description: string;
  status: ReportStatus;
  resolvedBy: IDType | null;
  retainUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReportWithImages = Report & {
  images: string[];
};

export type ReportCreateInput = {
  reporterId: IDType;
  targetType: ReportTargetType;
  targetId?: IDType;
  contextOrderId?: IDType;
  conversationId?: IDType;
  problemCategory: ProblemCategory;
  problemType: ProblemType;
  description: string;
  imageUrls?: string[];
};

export type ReportUpdateInput = {
  description?: string;
  imageUrls?: string[];
};

export type ReportStatusUpdateInput = {
  status: ReportStatus;
  resolvedBy?: IDType;
};

export type ReportFilter = Partial<{
  id: IDType;
  reporterId: IDType;
  contextOrderId: IDType;
  conversationId: IDType;
  targetType: ReportTargetType;
  targetId: IDType;
  status: ReportStatus;
  problemCategory: ProblemCategory;
  createdAt: Date;
}>;
