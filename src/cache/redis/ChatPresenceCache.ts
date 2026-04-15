/**
 * @fileoverview ChatPresenceCache - Redis-backed presence, inChat, and typing state
 * @module repositories/cache/ChatPresenceCache
 */

import { RedisClientType } from '../../libs/redis.js';
import IChatPresenceCache from '../interfaces/ChatPresenceCache.js';

/**
 * All presence state is ephemeral — stored in Redis only, never touched in DB.
 *
 * Key schema:
 *   sockets:{userId}                   → Redis Set  (socketIds) — online if SCARD > 0, TTL 5min
 *   inChat:{conversationId}:{userId}   → Redis Set  (socketIds) — inChat if SCARD > 0, TTL 5min
 *   typing:{conversationId}:{userId}   → String "1" with 5s TTL
 *
 * TTL strategy:
 *   - sockets and inChat keys use a 5-minute safety TTL, refreshed on every write.
 *     If the server crashes and never fires disconnect, these keys auto-expire
 *     instead of leaking forever.
 *   - typing already has a 5s TTL.
 */

/** Safety TTL for presence Sets (seconds) */
const PRESENCE_TTL: number = 300;

export default class ChatPresenceCache implements IChatPresenceCache {
  constructor(private readonly client: RedisClientType) {}

  // ─── Online / Socket tracking ──────────────────────────────────────────────

  /**
   * Register a socket as active for a user.
   * Refreshes TTL on every add to keep the key alive while connected.
   */
  async addSocket({ userId, socketId }) {
    const key = `sockets:${userId}`;
    await this.client.sAdd(key, socketId);
    await this.client.expire(key, PRESENCE_TTL);
  }

  /**
   * Remove a socket from a user's active set.
   */
  async removeSocket({ userId, socketId }) {
    await this.client.sRem(`sockets:${userId}`, socketId);
  }

  /**
   * Count remaining active sockets for a user.
   */
  async countSockets({ userId }) {
    return Number(await this.client.sCard(`sockets:${userId}`));
  }

  /**
   * Returns true if the user has at least one active socket (is online).
   */
  async isOnline({ userId }) {
    return (await this.countSockets({ userId })) > 0;
  }

  /**
   * Refresh the TTL on the sockets key (called periodically via ping/pong).
   */
  async refreshPresence({ userId }) {
    await this.client.expire(`sockets:${userId}`, PRESENCE_TTL);
  }

  /**
   * Remove ALL sockets for a user — full cleanup on last disconnect.
   */
  async removeAllSockets({ userId }) {
    await this.client.del(`sockets:${userId}`);
  }

  // ─── inChat tracking ──────────────────────────────────────────────────────

  /**
   * Mark a socket as "inside" a conversation screen.
   * Refreshes TTL on every enter to keep the key alive.
   */
  async enterChat({ conversationId, userId, socketId }) {
    const key = `inChat:${conversationId}:${userId}`;
    await this.client.sAdd(key, socketId);
    await this.client.expire(key, PRESENCE_TTL);
  }

  /**
   * Remove a socket from the inChat set (device left chat screen or disconnected).
   */
  async leaveChat({ conversationId, userId, socketId }) {
    await this.client.sRem(`inChat:${conversationId}:${userId}`, socketId);
  }

  /**
   * Returns true if the user has any device currently showing this conversation.
   */
  async isInChat({ conversationId, userId }) {
    return Number(await this.client.sCard(`inChat:${conversationId}:${userId}`)) > 0;
  }

  /**
   * Remove a socket from ALL inChat keys.
   * Called on disconnect when we don't know which conversations were active.
   */
  async leaveAllChats({ userId, socketId, conversationIds }) {
    if (!conversationIds.length) return;
    const pipeline = this.client.multi();
    for (const cid of conversationIds) {
      pipeline.sRem(`inChat:${cid}:${userId}`, socketId);
    }
    await pipeline.exec();
  }

  /**
   * Remove ALL inChat keys for a user across all conversations — full cleanup.
   */
  async removeAllInChat({ userId, conversationIds }) {
    if (!conversationIds.length) return;
    const pipeline = this.client.multi();
    for (const cid of conversationIds) {
      pipeline.del(`inChat:${cid}:${userId}`);
    }
    await pipeline.exec();
  }

  // ─── Typing ────────────────────────────────────────────────────────────────

  /**
   * Set the typing indicator for a user in a conversation. Auto-expires in 5s.
   */
  async setTyping({ conversationId, userId }) {
    await this.client.set(`typing:${conversationId}:${userId}`, '1', { EX: 5 });
  }

  /**
   * Clear the typing indicator immediately.
   */
  async clearTyping({ conversationId, userId }) {
    await this.client.del(`typing:${conversationId}:${userId}`);
  }
}
