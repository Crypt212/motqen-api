import { $Enums } from '@prisma/client';

/**
 * @typedef {Object} UserPayload
 * @property {string} id
 * @property {$Enums.Role} role
 */


/** @typedef {import('express').Request & { user: UserPayload }} AuthenticatedRequest */
/** @typedef {import('express').Request & { user?: UserPayload }} MaybeAuthenticatedRequest */

// /**
//  * @typedef {function(req, res, next): number} AddFunction
//  * @param {number} a - The first number.
//  * @param {number} b - The second number.
//  * @returns {number} The sum of a and b.
//  */

/**
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

// Export empty object to make this a module
export { };
