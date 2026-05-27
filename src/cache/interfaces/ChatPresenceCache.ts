import { IDType } from '../../repositories/interfaces/Repository.js';

export default interface IChatPresenceCache {
  // ─── Online / Socket tracking ──────────────────────────────────────────────

  /**
   * Register a socket as active for a user.
   * Refreshes TTL on every add to keep the key alive while connected.
   * @returns The total number of active sockets for this user after adding.
   */
  addSocket(params: { userId: IDType; socketId: IDType }): Promise<number>;

  /**
   * Remove a socket from a user's active set.
   */
  removeSocket(params: { userId: IDType; socketId: IDType }): Promise<number>;

  /**
   * Count remaining active sockets for a user.
   */
  countSockets(params: { userId: IDType }): Promise<number>;

  /**
   * Returns true if the user has at least one active socket (is online).
   */
  isOnline(params: { userId: IDType }): Promise<boolean>;

  /**
   * Refresh the TTL on the sockets key (called periodically via ping/pong).
   */
  refreshPresence(params: { userId: IDType }): Promise<void>;

  /**
   * Remove ALL sockets for a user — full cleanup on last disconnect.
   */
  removeAllSockets(params: { userId: IDType }): Promise<void>;

  // ─── inChat tracking ──────────────────────────────────────────────────────

  /**
   * Mark a user as "inside" a conversation screen.
   * Refreshes TTL on every enter to keep the key alive.
   */
  enterChat(params: { conversationId: IDType; userId: IDType }): Promise<void>;

  /**
   * Remove a user from the inChat set (device left chat screen or disconnected).
   */
  leaveChat(params: { conversationId: IDType; userId: IDType }): Promise<void>;

  /**
   * Returns true if the user has any device currently showing this conversation.
   */
  isInChat(params: { conversationId: IDType; userId: IDType }): Promise<boolean>;

  /**
   * Remove a user from ALL inChat keys based on active tracking.
   * Called on disconnect.
   */
  leaveAllChats(params: { userId: IDType }): Promise<void>;

  /**
   * Remove ALL inChat keys for a user across all conversations — full cleanup.
   */
  removeAllInChat(params: { userId: IDType }): Promise<void>;

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
