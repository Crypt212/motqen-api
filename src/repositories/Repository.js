/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */

import { Prisma, PrismaClient } from '@prisma/client';

/**
 * @template T
 * @typedef {{
 *   [K in keyof T]?:
 *     T[K] | { in: T[K] extends Array<infer U> ? U[] : T[K][] }
 * }} FilterArgs
 */

/** @typedef {String} IDType */

/**
 * @template TEntity
 * @template TEntityData
 * @template TFilter
 */
export class Repository {

}
