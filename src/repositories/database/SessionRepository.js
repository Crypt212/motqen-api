import { PrismaClient } from "@prisma/client";
import { Repository } from "./Repository.js";

/**
 * @fileoverview Session Repository - Handle database operations for sessions
 * @module repositories/SessionRepository
 * @extends {Repository}
 */

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import("./Repository.js").IDType} IDType */
/** @typedef {import('./Repository.js').PaginationOptions} PaginationOptions */
/** @typedef {import('./Repository.js').OrderingOptions} OrderingOptions */
/** @template T @typedef {import('./Repository.js').PaginatedResult<T>} PaginatedResult */

/** @typedef {{userId: IDType, token: String, isRevoked: boolean, deviceId: String, lastUsedAt: Date, createdAt: Date, expiresAt: Date}} SessionData */
/** @typedef {SessionData & {id: IDType}} Session */
/** @typedef {Partial<SessionData>} OptionalSessionData */
/** @typedef {import("./Repository.js").FilterArgs<Session>} SessionFilter */


/**
 * Session Repository - Handles all database operations for sessions
 * @class
 * @extends Repository<SessionData, OptionalSessionData, Session, SessionFilter>
 */
export default class SessionRepository extends Repository {

  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, "session");
  }
}
