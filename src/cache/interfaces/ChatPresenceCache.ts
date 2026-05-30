import { IDType } from '../../repositories/interfaces/Repository.js';

export default interface IChatPresenceCache {
  // ─── Online / Socket tracking ──────────────────────────────────────────────

  /**
   * Register a socket ID for a user (single-device model).
   */
  setSocket(params: { userId: IDType; socketId: string }): Promise<void>;

  /**
   * Get the current socket ID for a user.
   */
  getSocket(params: { userId: IDType }): Promise<string | null>;

  /**
   * Remove the socket mapping for a user.
   */
  removeSocket(params: { userId: IDType }): Promise<void>;

  /**
   * Returns true if the user has an active socket.
   */
  isOnline(params: { userId: IDType }): Promise<boolean>;

  /**
   * Refresh the TTL on the sockets key.
   */
  refreshPresence(params: { userId: IDType }): Promise<void>;

  // ─── Conversation Members Cache ────────────────────────────────────────────

  /**
   * Cache the participants of a conversation.
   */
  addChatMembers(params: { conversationId: IDType; userIds: string[] }): Promise<void>;

  /**
   * Get the cached participants of a conversation.
   */
  getChatMembers(params: { conversationId: IDType }): Promise<string[]>;

  // ─── inChat tracking ──────────────────────────────────────────────────────

  /**
   * Mark a user as "inside" a partner's chat screen.
   */
  enterChat(params: { userId: IDType; partnerId: IDType }): Promise<void>;

  /**
   * Remove a user from a partner's chat screen.
   */
  leaveChat(params: { userId: IDType; partnerId: IDType }): Promise<void>;

  /**
   * Get list of userIds currently viewing this user's chat screen.
   */
  getViewers(params: { userId: IDType }): Promise<string[]>;

  /**
   * Returns true if the viewerId is currently inside the userId's chat screen.
   */
  isViewingMyChat(params: { viewerId: IDType; userId: IDType }): Promise<boolean>;

  /**
   * Remove a user from whatever partner's chat screen they were viewing.
   * Called on disconnect.
   */
  removeFromAllEnterSets(params: { userId: IDType }): Promise<void>;

  /**
   * Refresh the TTL on the partner's chat screen tracking.
   */
  refreshChatEnterTTL(params: { partnerId: IDType; ttl?: number }): Promise<void>;

  // ─── Participant Counters Cache ────────────────────────────────────────────

  /**
   * Cache participant's lastReceived and lastRead message numbers.
   */
  setParticipantCounters(params: {
    conversationId: IDType;
    userId: IDType;
    lastReceived: number;
    lastRead: number;
  }): Promise<void>;

  /**
   * Get cached participant counters.
   */
  getParticipantCounters(params: {
    conversationId: IDType;
    userId: IDType;
  }): Promise<{ lastReceived: number; lastRead: number } | null>;

  // ─── Typing ────────────────────────────────────────────────────────────────


  /**
   * Set the typing indicator for a user in a conversation. Auto-expires in 5s.
   */
  setTyping(params: { conversationId: IDType; userId: IDType }): Promise<void>;

  /**
   * Clear the typing indicator immediately.
   */
  clearTyping(params: { conversationId: IDType; userId: IDType }): Promise<void>;
}
