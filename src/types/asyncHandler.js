/**
 * @fileoverview Async Handler - Wrapper functions for async controller error handling
 * @module types/asyncHandler
 */

import { $Enums } from '@prisma/client';


/**
 * @typedef {{ user: {id: string, role: $Enums.Role, isWorker: Boolean, isClient: Boolean} }} UserPayload
 */


/**
 * @typedef {{fieldname: string, originalname: string, encoding: string, mimetype: string, buffer: Buffer, size: number}} MulterFile 
 * @typedef {{file?: MulterFile, files?: MulterFile[] }} MulterPayload
 */


/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * @template T
 * @typedef {function(Request & T, Response, NextFunction): any} RequestHandler<T>
 */

/**
 * @template T = {}
 * Controller wrapper to ensure consistent error handling
 * @param {RequestHandler<T>} controller
 * @returns {RequestHandler<T>}
 */
export function asyncHandler(controller) {
  /** @type RequestHandler<T> */
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}
