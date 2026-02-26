/**
 * @fileoverview Token Type Definitions - JWT token payload type definitions
 * @module types/tokens
 */

/**
 * @typedef {Object} RefreshTokenPayload
 * @property {"refresh"} type
 * @property {string} userId
 * @property {string} phoneNumber
 * @property {import("./role").Role} role
 * @property {boolean} isWorker
 * @property {boolean} isClient
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} AccessTokenPayload
 * @property {"access"} type
 * @property {string} userId
 * @property {string} phoneNumber
 * @property {import("./role").Role} role
 * @property {boolean} isWorker
 * @property {boolean} isClient
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} LoginTokenPayload
 * @property {"login"} type
 * @property {string} phoneNumber
 */

/**
 * @typedef {Object} RegisterTokenPayload
 * @property {"register"} type
 * @property {string} phoneNumber
 */

// Map token types to their payload types
/**
 * @typedef {Object} TokenTypeMap
 * @property {RefreshTokenPayload} refresh
 * @property {AccessTokenPayload} access
 * @property {LoginTokenPayload} login
 * @property {RegisterTokenPayload} register
 */

// All possible payload types
/**
 * @typedef {RefreshTokenPayload | AccessTokenPayload | LoginTokenPayload | RegisterTokenPayload} AnyTokenPayload
 */

export {};
