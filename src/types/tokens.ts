/**
 * @fileoverview Token Type Definitions - JWT token payload type definitions
 * @module types/tokens
 */

import { IDType } from '../repositories/interfaces/Repository.js';

export type RefreshTokenPayload = {
  type: 'refresh';
  phoneNumber: string;
  userId: IDType;
  isAdmin: boolean;
};

export type AccessTokenPayload = {
  type: 'access';
  phoneNumber: string;
  userId: IDType;
  isAdmin: boolean;
};

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
