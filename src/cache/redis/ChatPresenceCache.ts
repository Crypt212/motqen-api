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

  async setSocket({
    userId,
    socketId,
  }: {
    userId: string | number;
    socketId: string;
  }): Promise<void> {
    const key = `sockets:${userId}`;
    await this.client.set(key, socketId, { EX: PRESENCE_TTL });
  }

  async getSocket({ userId }: { userId: string | number }): Promise<string | null> {
    const result = await this.client.get(`sockets:${userId}`);
    return result ? String(result) : null;
  }

  async removeSocket({ userId }: { userId: string | number }): Promise<void> {
    await this.client.del(`sockets:${userId}`);
  }

  async isOnline({ userId }: { userId: string | number }): Promise<boolean> {
    return (await this.client.exists(`sockets:${userId}`)) === 1;
  }

  async refreshPresence({ userId }: { userId: string | number }): Promise<void> {
    await this.client.expire(`sockets:${userId}`, PRESENCE_TTL);
  }

  // ─── Conversation Members Cache ────────────────────────────────────────────

  async addChatMembers({
    conversationId,
    userIds,
  }: {
    conversationId: string | number;
    userIds: string[];
  }): Promise<void> {
    if (!userIds || userIds.length === 0) return;
    const key = `chat:members:${conversationId}`;
    await this.client.sAdd(key, userIds);
    await this.client.expire(key, 86400); // 24h TTL
  }

  async getChatMembers({ conversationId }: { conversationId: string | number }): Promise<string[]> {
    const members = await this.client.sMembers(`chat:members:${conversationId}`);
    return (Array.isArray(members) ? members : Array.from(members)).map(String);
  }

  // ─── inChat tracking ──────────────────────────────────────────────────────

  async enterChat({
    userId,
    partnerId,
  }: {
    userId: string | number;
    partnerId: string | number;
  }): Promise<void> {
    const roomKey = `chat:enter:${partnerId}`;
    await this.client.sAdd(roomKey, String(userId));
    await this.client.expire(roomKey, PRESENCE_TTL);

    const viewerKey = `chat:viewing:${userId}`;
    await this.client.set(viewerKey, String(partnerId), { EX: PRESENCE_TTL });
  }

  async leaveChat({
    userId,
    partnerId,
  }: {
    userId: string | number;
    partnerId: string | number;
  }): Promise<void> {
    await this.client.sRem(`chat:enter:${partnerId}`, String(userId));
    await this.client.del(`chat:viewing:${userId}`);
  }

  async getViewers({ userId }: { userId: string | number }): Promise<string[]> {
    const viewers = await this.client.sMembers(`chat:enter:${userId}`);
    return (Array.isArray(viewers) ? viewers : Array.from(viewers)).map(String);
  }

  async isViewingMyChat({
    viewerId,
    userId,
  }: {
    viewerId: string | number;
    userId: string | number;
  }): Promise<boolean> {
    const member = await this.client.sIsMember(`chat:enter:${userId}`, String(viewerId));
    return Boolean(member && member !== '0' && member !== 0);
  }

  async removeFromAllEnterSets({ userId }: { userId: string | number }): Promise<void> {
    const viewerKey = `chat:viewing:${userId}`;
    const partnerId = await this.client.get(viewerKey);

    if (partnerId) {
      const pipeline = this.client.multi();
      pipeline.sRem(`chat:enter:${partnerId}`, String(userId));
      pipeline.del(viewerKey);
      await pipeline.exec();
    }
  }

  async refreshChatEnterTTL({
    partnerId,
    ttl = 600,
  }: {
    partnerId: string | number;
    ttl?: number;
  }): Promise<void> {
    await this.client.expire(`chat:enter:${partnerId}`, ttl);
  }

  // ─── Participant Counters Cache ────────────────────────────────────────────

  async setParticipantCounters({
    conversationId,
    userId,
    lastReceived,
    lastRead,
  }: {
    conversationId: string | number;
    userId: string | number;
    lastReceived: number;
    lastRead: number;
  }): Promise<void> {
    const key = `chat:counters:${conversationId}:${userId}`;
    await this.client.hSet(key, { lastReceived: String(lastReceived), lastRead: String(lastRead) });
    await this.client.expire(key, 3600); // 1 hour TTL
  }

  async getParticipantCounters({
    conversationId,
    userId,
  }: {
    conversationId: string | number;
    userId: string | number;
  }): Promise<{ lastReceived: number; lastRead: number } | null> {
    const key = `chat:counters:${conversationId}:${userId}`;
    const result = await this.client.hGetAll(key);
    if (!result || Object.keys(result).length === 0) return null;

    let lastReceived: string | undefined;
    let lastRead: string | undefined;

    if (result instanceof Map) {
      const received = result.get('lastReceived');
      const read = result.get('lastRead');
      lastReceived = received != null ? String(received) : undefined;
      lastRead = read != null ? String(read) : undefined;
    } else if (Array.isArray(result)) {
      for (let i = 0; i < result.length; i += 2) {
        const field = result[i];
        const value = result[i + 1];
        if (String(field) === 'lastReceived') {
          lastReceived = value != null ? String(value) : undefined;
        } else if (String(field) === 'lastRead') {
          lastRead = value != null ? String(value) : undefined;
        }
      }
    }

    if (!lastReceived || !lastRead) return null;

    return {
      lastReceived: parseInt(lastReceived, 10),
      lastRead: parseInt(lastRead, 10),
    };
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
