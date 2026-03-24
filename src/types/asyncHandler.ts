/**
 * @fileoverview Async Handler - Wrapper functions for async controller error handling
 * @module types/asyncHandler
 */

import { IDType } from '../repositories/interfaces/Repository.js';
import { AccountStatus, Role } from '../domain/user.entity.js';
import { VerificationStatus } from '../domain/workerProfile.entity.js';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';

// Map token types to the payload that should be attached to request

export type DeviceID = string;

export type UserState = {
  userId: IDType,
  phoneNumber: string,
  role: Role,
  accountStatus: AccountStatus,
  worker?: {
    id: IDType,
    verification: {
      status: VerificationStatus,
      reason?: string,
    },

  },
  client?: {
    id: IDType,
  }
}

export type Request = ExpressRequest & { deviceId?: DeviceID } & { userState?: UserState }

export type RequestHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>

/**
 * Controller wrapper to ensure consistent error handling
 */
export function asyncHandler(controller: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}


export const errorHandler: ErrorRequestHandler = (err, _, res) => {
  res.status(err.status ?? 500).json({ error: err.message });
};
