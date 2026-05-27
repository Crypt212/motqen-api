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
 *   inChat:{conversationId}            → Redis Set  (userIds) — inChat if SISMEMBER is true, TTL 5min
 *   inChats:{userId}                   → Redis Set  (conversationIds) — active chats for user, TTL 5min
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
   * @returns The total number of active sockets for this user after adding.
   */
  async addSocket({ userId, socketId }): Promise<number> {
    const key = `sockets:${userId}`;
    await this.client.sAdd(key, socketId);
    await this.client.expire(key, PRESENCE_TTL);
    return Number(await this.client.sCard(key));
  }

  /**
   * Remove a socket from a user's active set.
   * @returns The total number of active sockets for this user after removal.
   */
  async removeSocket({ userId, socketId }): Promise<number> {
    await this.client.sRem(`sockets:${userId}`, socketId);
    return Number(await this.client.sCard(`sockets:${userId}`));
  }

  /**
   * Count remaining active sockets for a user.
   */
  async countSockets({ userId }): Promise<number> {
    return Number(await this.client.sCard(`sockets:${userId}`));
  }

  /**
   * Returns true if the user has at least one active socket (is online).
   */
  async isOnline({ userId }): Promise<boolean> {
    return (await this.countSockets({ userId })) > 0;
  }

  /**
   * Refresh the TTL on the sockets key (called periodically via ping/pong).
   */
  async refreshPresence({ userId }): Promise<void> {
    const pipeline = this.client.multi();
    pipeline.expire(`sockets:${userId}`, PRESENCE_TTL);

    // Also refresh the TTL for active chat rooms to prevent silent timeouts
    const userKey = `inChats:${userId}`;
    const conversationIds = await this.client.sMembers(userKey);
    const conversationIdsArray = Array.isArray(conversationIds)
      ? conversationIds
      : Array.from(conversationIds);
    if (conversationIdsArray.length > 0) {
      pipeline.expire(userKey, PRESENCE_TTL);
      for (const cid of conversationIdsArray) {
        pipeline.expire(`inChat:${cid}`, PRESENCE_TTL);
      }
    }

    await pipeline.exec();
  }

  /**
   * Remove ALL sockets for a user — full cleanup on last disconnect.
   */
  async removeAllSockets({ userId }): Promise<void> {
    await this.client.del(`sockets:${userId}`);
  }

  // ─── inChat tracking ──────────────────────────────────────────────────────

  /**
   * Mark a user as "inside" a conversation screen.
   * Refreshes TTL on every enter to keep the key alive.
   */
  async enterChat({ conversationId, userId }): Promise<void> {
    const roomKey = `inChat:${conversationId}`;
    await this.client.sAdd(roomKey, String(userId));
    await this.client.expire(roomKey, PRESENCE_TTL);

    const userKey = `inChats:${userId}`;
    await this.client.sAdd(userKey, String(conversationId));
    await this.client.expire(userKey, PRESENCE_TTL);
  }

  /**
   * Remove a user from the inChat set (device left chat screen or disconnected).
   */
  async leaveChat({ conversationId, userId }): Promise<void> {
    await this.client.sRem(`inChat:${conversationId}`, String(userId));
    await this.client.sRem(`inChats:${userId}`, String(conversationId));
  }

  /**
   * Returns true if the user has any device currently showing this conversation.
   */
  async isInChat({ conversationId, userId }): Promise<boolean> {
    const member = await this.client.sIsMember(`inChat:${conversationId}`, String(userId));
    return member === 1 || member === '1';
  }

  /**
   * Remove a user from ALL inChat keys based on tracked conversations.
   * Called on disconnect.
   */
  async leaveAllChats({ userId }): Promise<void> {
    const userKey = `inChats:${userId}`;
    const conversationIdsResult = await this.client.sMembers(userKey);
    const conversationIds = Array.isArray(conversationIdsResult)
      ? conversationIdsResult
      : Array.from(conversationIdsResult);

    if (!conversationIds.length) return;

    const pipeline = this.client.multi();
    for (const cid of conversationIds) {
      pipeline.sRem(`inChat:${cid}`, String(userId));
    }
    pipeline.del(userKey);
    await pipeline.exec();
  }

  /**
   * Remove ALL inChat keys for a user across all conversations — full cleanup.
   */
  async removeAllInChat({ userId }): Promise<void> {
    await this.leaveAllChats({ userId });
  }

  // ─── Typing ────────────────────────────────────────────────────────────────

  /**
   * Set the typing indicator for a user in a conversation. Auto-expires in 5s.
   */
  async setTyping({ conversationId, userId }): Promise<void> {
    await this.client.set(`typing:${conversationId}:${userId}`, '1', { EX: 5 });
  }

  /**
   * Clear the typing indicator immediately.
   */
  async clearTyping({ conversationId, userId }): Promise<void> {
    await this.client.del(`typing:${conversationId}:${userId}`);
  }
}
