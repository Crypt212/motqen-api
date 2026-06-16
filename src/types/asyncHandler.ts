/**
 * @fileoverview Async Handler - Wrapper functions for async controller error handling
 * @module types/asyncHandler
 */

import { z } from '../libs/zod.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { AccountStatus } from '../domain/user.entity.js';
import { VerificationStatus } from '../domain/workerProfile.entity.js';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';
import { validateBody, validateParams, validateQuery } from 'src/middlewares/validateRequest.js';
import { EmptySchema } from 'src/schemas/common.js';

// Map token types to the payload that should be attached to request

export type DeviceID = string;

export type UserState = {
  userId: IDType;
  phoneNumber: string;
  role: 'WORKER' | 'CLIENT';
  accountStatus: AccountStatus;
  worker?: {
    id: IDType;
    verification: {
      status: VerificationStatus;
      reason?: string;
    };
  };
  client?: {
    id: IDType;
  };
};

export type AdminState = {
  adminId: IDType;
  username: string;
  role: string;
  domain: string;
  type: string;
};

export type Request = ExpressRequest & { deviceId?: DeviceID, userState?: UserState, adminState?: AdminState };
export type ParsedRequest<Body, Query, Params> = Request & { parsed?: { body?: Body, query?: Query, params?: Params } };

export type RequestHandler<Body, Query, Params, ResponseBody> = (
  req: ParsedRequest<Body, Query, Params>,
  res: Response<ResponseBody>,
  next: NextFunction
) => void | Promise<void>;

/**
 * Controller wrapper to ensure consistent error handling
 */
export function asyncHandler<TResponseBody, TBody, TQuery, TParams>(controller: RequestHandler<TBody, TQuery, TParams, TResponseBody>): RequestHandler<TBody, TQuery, TParams, TResponseBody> {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}


export function createRoute<TResponseBody, TBody, TQuery, TParams>(params: {
  schemas: {
    body: z.ZodType<TBody> & z.ZodObject,
    query: z.ZodType<TQuery> & z.ZodObject,
    params: z.ZodType<TParams> & z.ZodObject,
  },
  inBetweenMiddlewares?: import('express').RequestHandler[],
  handler: RequestHandler<TBody, TQuery, TParams, TResponseBody>
}) {
  const { schemas, inBetweenMiddlewares, handler } = params;
  const middlewares = [];
  if (schemas.body && schemas.body !== EmptySchema) middlewares.push(validateBody(schemas.body));
  if (schemas.query && schemas.query !== EmptySchema) middlewares.push(validateQuery(schemas.query));
  if (schemas.params && schemas.params !== EmptySchema) middlewares.push(validateParams(schemas.params));

  return [...middlewares, ...(Array.isArray(inBetweenMiddlewares) ? inBetweenMiddlewares : []), asyncHandler(handler)];
}

export const errorHandler: ErrorRequestHandler = (err, _, res) => {
  res.status(err.status ?? 500).json({ error: err.message });
};
