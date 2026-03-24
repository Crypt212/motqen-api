import { IDType } from "../repositories/interfaces/Repository.js";

export type Session = {
  id: IDType,
  userId: IDType,

  token: string,
  isRevoked: boolean,
  deviceId: string,
  ipAddress: string,
  userAgent: string,
  lastUsedAt: Date,
  expiresAt: Date,

  updatedAt: Date,
  createdAt: Date,
}

export type SessionCreateInput = {
  token: string,
  isRevoked?: boolean,
  deviceId: string,
  ipAddress?: string,
  userAgent?: string,
  lastUsedAt?: Date,
  expiresAt: Date,
}

export type SessionUpdateInput = Partial<SessionCreateInput>;

export type SessionFilter = {
  id?: IDType,
  userId?: IDType,
  deviceId?: string
  token?: string
}
