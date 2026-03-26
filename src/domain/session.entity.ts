import { IDType } from '../repositories/interfaces/Repository.js';
import { FieldTypeDefinition } from '../types/query.js';
import { FilterFromDescriptor } from '../schemas/common.js';

export type Session = {
  id: IDType;
  userId: IDType;

  token: string;
  isRevoked: boolean;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastUsedAt: Date;
  expiresAt: Date;

  updatedAt: Date;
  createdAt: Date;
};

export type SessionCreateInput = {
  token: string;
  isRevoked?: boolean;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
  lastUsedAt?: Date;
  expiresAt: Date;
};

export type SessionUpdateInput = Partial<SessionCreateInput>;

export const SessionFilterDescriptor = {
  id: { type: 'uuid' as const },
  userId: { type: 'uuid' as const },
  deviceId: { type: 'string' as const },
  token: { type: 'string' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type SessionFilter = FilterFromDescriptor<typeof SessionFilterDescriptor>;
