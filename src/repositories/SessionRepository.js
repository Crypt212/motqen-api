import prisma from "../libs/database.js";
import { Repository } from "./Repository.js";

/**
 * @fileoverview Session Repository - Handle database operations for sessions
 * @module repositories/SessionRepository
 * @extends {Repository}
 */

/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{userId: IDType, token: String, isRevoked: Boolean, deviceFingerprint: String, ipAddress?: String, userAgent?: String, lastUsedAt: Date, createdAt: Date, expiresAt: Date}} SessionData */
/** @typedef {SessionData | {id: IDType}} Session */
/** @typedef {import("./Repository.js").FilterArgs<Session>} SessionFilter */


/**
 * Session Repository - Handles all database operations for sessions
 * @class
 * @extends Repository<Session, SessionData, SessionFilter>
 */
export default class SessionRepository extends Repository {


  constructor() {
    super(prisma.session);
  }
}
