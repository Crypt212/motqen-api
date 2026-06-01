/**
 * @fileoverview Token Type Definitions - JWT token payload type definitions
 * @module types/tokens
 */

import { Role } from '../domain/user.entity.js';
import { AdminRole } from '../domain/admin.entity.js';
import { IDType } from '../repositories/interfaces/Repository.js';

export type AdminRefreshTokenPayload = {
  type: 'refresh';
  adminId: IDType;
  username: string;
  role: AdminRole;
  domain: 'admin';
};

export type AdminAccessTokenPayload = {
  type: 'access';
  adminId: IDType;
  username: string;
  role: AdminRole;
  domain: 'admin';
};

export type UserRefreshTokenPayload = {
  type: 'refresh';
  domain: 'user';
  phoneNumber: string;
  userId: IDType;
  role: Role;
};

export type UserAccessTokenPayload = {
  type: 'access';
  domain: 'user';
  phoneNumber: string;
  userId: IDType;
  role: Role;
};

export type RefreshTokenPayload = UserRefreshTokenPayload | AdminRefreshTokenPayload;

export type AccessTokenPayload = UserAccessTokenPayload | AdminAccessTokenPayload;

export type LoginTokenPayload = {
  type: 'login';
  phoneNumber: string;
};

export type RegisterTokenPayload = {
  type: 'register';
  phoneNumber: string;
};

// Map token types to their payload types
export type TokenTypeMap = {
  refresh: RefreshTokenPayload;
  access: AccessTokenPayload;
  login: LoginTokenPayload;
  register: RegisterTokenPayload;
};

// All possible payload types
export type AnyTokenPayload =
  | RefreshTokenPayload
  | AccessTokenPayload
  | LoginTokenPayload
  | RegisterTokenPayload;

export {};
