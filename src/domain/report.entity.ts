import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';
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

export const ReportFilterDescriptor = {
  id: { type: 'uuid' },
  reporterId: { type: 'uuid' },
  contextOrderId: { type: 'uuid' },
  conversationId: { type: 'uuid' },
  targetType: {
    type: 'enum',
    enumValues: ['ORDER', 'CHAT_MESSAGE', 'WORKER_PROFILE', 'CLIENT_PROFILE'] as const,
  },
  targetId: { type: 'uuid' },
  status: {
    type: 'enum',
    enumValues: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED'] as const,
  },
  problemCategory: {
    type: 'enum',
    enumValues: ['ORDER_ISSUE', 'WORKER_CONDUCT', 'CLIENT_CONDUCT', 'CHAT_MESSAGE', 'OTHER'] as const,
  },
  createdAt: { type: 'date', sortable: true },
} satisfies Record<string, FieldTypeDefinition>;

export type ReportFilter = FilterFromDescriptor<typeof ReportFilterDescriptor>;
