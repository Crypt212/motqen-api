import { IDType } from '../../repositories/interfaces/Repository.js';
import IChatPresenceCache from '../../cache/interfaces/ChatPresenceCache.js';
import {
  Conversation,
  ConversationWithParticipantsAndMessages,
  GetConversations,
} from '../../domain/conversation.entity.js';
import { Message, MessageType } from '../../domain/message.entity.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';

export default interface IChatService {
  /**
   * Get partner counters + conversation messageCounter from cache/DB.
   */
  getChatSnapshot(params: { conversationId: IDType; userId: IDType }): Promise<{
    partnerLastReceivedMessageNumber: number;
    partnerLastReadMessageNumber: number;
    messageCounter: number;
  }>;

  /**
   * Get or create the conversation between a Worker and a Client.
   * Idempotent — returns existing conversation if the pair already has one.
   */
  getOrCreateConversation(params: {
    workerId: IDType | undefined;
    clientId: IDType | undefined;
  }): Promise<Conversation>;

  /**
   * List all conversations for a user with derived unreadCount.
   */
  getConversations(params: {
    pagination: PaginationOptions;
    sort: SortOptions<ConversationWithParticipantsAndMessages>;
    filter: { userId: IDType; role: 'WORKER' | 'CLIENT' };
  }): Promise<
    PaginatedResultMeta & {
      conversations: GetConversations[];
    }
  >;

  /**
   * Send a text message — atomically increments the counter and inserts the message.
   */
  sendMessage(params: {
    conversationId: IDType;
    senderId: IDType;
    content: string;
    type?: MessageType;
  }): Promise<Message>;

  /**
   * Send an image message — uploads to Cloudinary then inserts.
   */
  sendImageMessage(params: {
    conversationId: IDType;
    senderId: IDType;
    imageBuffer: Buffer;
  }): Promise<Message>;

  /**
   * Mark messages as read up to and including lastMessageId.
   */
  markAsRead(params: {
    conversationId: IDType;
    userId: IDType;
    lastMessageId: IDType;
  }): Promise<{ readUpTo: number }>;

  /**
   * Paginated message history — cursor-based by messageNumber.
   */
  getMessages(params: {
    conversationId: IDType;
    userId: IDType;
    after?: number;
    limit?: number;
  }): Promise<{
    messages: Message[];
    snapshot: {
      partnerLastReceivedMessageNumber: number;
      partnerLastReadMessageNumber: number;
      messageCounter: number;
    };
  }>;

  /**
   * Missed messages since a given messageNumber (for offline catch-up).
   */
  getMissedMessages(params: {
    conversationId: IDType;
    userId: IDType;
    afterMessageNumber: number;
    limit: number;
  }): Promise<{
    messages: Message[];
    snapshot: {
      partnerLastReceivedMessageNumber: number;
      partnerLastReadMessageNumber: number;
      messageCounter: number;
    };
  }>;

  /**
   * Optimized participant validation and partner ID lookup using Redis cache.
   */
  resolveParticipants(params: { conversationId: IDType; userId: IDType }): Promise<IDType[]>;

  /**
   * Mark messages as delivered for a recipient up to a given messageNumber.
   */
  markAsDelivered(params: {
    conversationId: IDType;
    userId: IDType;
    lastMessageId: IDType;
  }): Promise<{ deliveredUpTo: number }>;

  /**
   * Access the underlying presence cache.
   */
  get presence(): IChatPresenceCache;
}
