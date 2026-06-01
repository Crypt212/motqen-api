import { FieldTypeDefinition } from '../types/query.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { IDType } from '../repositories/interfaces/Repository.js';

export type AdminSession = {
  id: IDType;
  adminId: IDType;
  token: string;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokedBy: string | null;
  deviceId: string;
  fcmToken: string | null;
  lastUsedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminSessionCreateInput = Omit<
  AdminSession,
  'id' | 'createdAt' | 'updatedAt' | 'revokedAt' | 'revokedBy' | 'fcmToken'
> & {
  fcmToken?: string | null;
};
export type AdminSessionUpdateInput = Partial<AdminSessionCreateInput>;

export const AdminSessionFilterDescriptor = {
  id: { type: 'uuid' as const },
  adminId: { type: 'uuid' as const },
  deviceId: { type: 'string' as const },
  token: { type: 'string' as const },
  isRevoked: { type: 'boolean' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type AdminSessionFilter = FilterFromDescriptor<typeof AdminSessionFilterDescriptor>;
