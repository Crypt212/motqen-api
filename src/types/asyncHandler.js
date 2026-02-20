/**
 * @fileoverview Async Handler - Wrapper functions for async controller error handling
 * @module types/asyncHandler
 */

/**
 * @typedef {import('../types/express.js').AuthenticatedRequest} AuthenticatedRequest
 * @typedef {import('../types/express.js').MaybeAuthenticatedRequest} MaybeAuthenticatedRequest
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/** @typedef {function(Request, Response, NextFunction): any} RequestHandler */
/** @typedef {function(AuthenticatedRequest, Response, NextFunction): any} AuthenticatedRequestHandler */

/**
 * Controller wrapper to ensure consistent error handling
 * @param {RequestHandler} controller
 * @returns {RequestHandler}
 */
export function asyncUnAuthenticatedHandler(controller) {
  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}

/**
 * Authenticated controller wrapper to ensure consistent error handling
 * @param {AuthenticatedRequestHandler} controller
 * @returns {AuthenticatedRequestHandler}
 */
export function asyncAuthenticatedHandler(controller) {
  /**
   * @param {AuthenticatedRequest} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}
