import { IDType } from '../repositories/interfaces/Repository.js';
export type Session = {
  id: IDType;
  userId: IDType;

  token: string;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokedBy: string | null;
  deviceId: string;
  fcmToken: string | null;
  lastUsedAt: Date;
  expiresAt: Date;

  updatedAt: Date;
  createdAt: Date;
};

export type SessionCreateInput = Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'revokedAt' | 'revokedBy'>;

export type SessionUpdateInput = Partial<SessionCreateInput>;

export type SessionFilter = Partial<{
  id: IDType;
  userId: IDType;
  deviceId: string;
  token: string;
}>;
