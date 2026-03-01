/**
 * @fileoverview ChatPresenceCache - Redis-backed presence, inChat, and typing state
 * @module repositories/cache/ChatPresenceCache
 */

import redisClient from '../../libs/redis.js';

/**
 * All presence state is ephemeral — stored in Redis only, never touched in DB.
 *
 * Key schema:
 *   sockets:{userId}                   → Redis Set  (socketIds) — online if SCARD > 0
 *   inChat:{conversationId}:{userId}   → Redis Set  (socketIds) — inChat if SCARD > 0
 *   typing:{conversationId}:{userId}   → String "1" with 5s TTL
 */
export default class ChatPresenceCache {
  #client;

  constructor() {
    this.#client = redisClient;
  }

  // ─── Online / Socket tracking ──────────────────────────────────────────────

  /**
   * Register a socket as active for a user.
   * @param {{ userId: string, socketId: string }} params
   */
  async addSocket({ userId, socketId }) {
    await this.#client.sAdd(`sockets:${userId}`, socketId);
  }

  /**
   * Remove a socket from a user's active set.
   * @param {{ userId: string, socketId: string }} params
   */
  async removeSocket({ userId, socketId }) {
    await this.#client.sRem(`sockets:${userId}`, socketId);
  }

  /**
   * Count remaining active sockets for a user.
   * @param {{ userId: string }} params
   * @returns {Promise<number>}
   */
  async countSockets({ userId }) {
    return Number(await this.#client.sCard(`sockets:${userId}`));
  }

  /**
   * Returns true if the user has at least one active socket (is online).
   * @param {{ userId: string }} params
   * @returns {Promise<boolean>}
   */
  async isOnline({ userId }) {
    return (await this.countSockets({ userId })) > 0;
  }

  // ─── inChat tracking ──────────────────────────────────────────────────────

  /**
   * Mark a socket as "inside" a conversation screen.
   * @param {{ conversationId: string, userId: string, socketId: string }} params
   */
  async enterChat({ conversationId, userId, socketId }) {
    await this.#client.sAdd(`inChat:${conversationId}:${userId}`, socketId);
  }

  /**
   * Remove a socket from the inChat set (device left chat screen or disconnected).
   * @param {{ conversationId: string, userId: string, socketId: string }} params
   */
  async leaveChat({ conversationId, userId, socketId }) {
    await this.#client.sRem(`inChat:${conversationId}:${userId}`, socketId);
  }

  /**
   * Returns true if the user has any device currently showing this conversation.
   * @param {{ conversationId: string, userId: string }} params
   * @returns {Promise<boolean>}
   */
  async isInChat({ conversationId, userId }) {
    return Number(await this.#client.sCard(`inChat:${conversationId}:${userId}`)) > 0;
  }

  /**
   * Remove a socket from ALL inChat keys.
   * Called on disconnect when we don't know which conversations were active.
   * @param {{ userId: string, socketId: string, conversationIds: string[] }} params
   */
  async leaveAllChats({ userId, socketId, conversationIds }) {
    if (!conversationIds.length) return;
    const pipeline = this.#client.multi();
    for (const cid of conversationIds) {
      pipeline.sRem(`inChat:${cid}:${userId}`, socketId);
    }
    await pipeline.exec();
  }

  // ─── Typing ────────────────────────────────────────────────────────────────

  /**
   * Set the typing indicator for a user in a conversation. Auto-expires in 5s.
   * @param {{ conversationId: string, userId: string }} params
   */
  async setTyping({ conversationId, userId }) {
    await this.#client.set(`typing:${conversationId}:${userId}`, '1', { EX: 5 });
  }

  /**
   * Clear the typing indicator immediately.
   * @param {{ conversationId: string, userId: string }} params
   */
  async clearTyping({ conversationId, userId }) {
    await this.#client.del(`typing:${conversationId}:${userId}`);
  }
}
