/**
 * @fileoverview Async Handler - Wrapper functions for async controller error handling
 * @module types/asyncHandler
 */

import { $Enums } from '@prisma/client';

/** @typedef {import('../repositories/database/Repository').IDType} IDType */
// Map token types to the payload that should be attached to request

/**
 * @typedef {import('./tokens.js').RefreshTokenPayload} RefreshTokenPayload
 * @typedef {import('./tokens.js').AccessTokenPayload} AccessTokenPayload
 * @typedef {import('./tokens.js').LoginTokenPayload} LoginTokenPayload
 * @typedef {import('./tokens.js').RegisterTokenPayload} RegisterTokenPayload
 */

/**
 * @typedef {{fieldname: string, originalname: string, encoding: string, mimetype: string, buffer: Buffer, size: number}} MulterFile
 * @typedef {{file?: MulterFile, files?: MulterFile[] }} MulterPayload
 */

/** @typedef {string} DeviceID */


/**
 * @typedef {(import('express').Request & { deviceId: DeviceID? } & { refresh: RefreshTokenPayload? } & { access: AccessTokenPayload? } & { register: RegisterTokenPayload? } & { login: LoginTokenPayload? }) & Partial<MulterPayload>} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * @typedef {function(Request, Response, NextFunction): any} RequestHandler
 */

/**
 * Controller wrapper to ensure consistent error handling
 * @param {RequestHandler} controller
 * @returns {RequestHandler}
 */
export function asyncHandler(controller) {
  /** @type RequestHandler */
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}
