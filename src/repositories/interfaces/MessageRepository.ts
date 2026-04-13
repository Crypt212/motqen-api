import { Message, MessageCreateInput, MessageFilter } from '../../domain/message.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';

export default interface IMessageRepository {
  /**
   * Check if message exists
   */
  exists(params: { filter: MessageFilter }): Promise<boolean>;

  /**
   * Find a message
   */
  find(params: { filter: MessageFilter }): Promise<Message | null>;

  /**
   * Find messages
   */
  findMany(params: {
    filter?: MessageFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Message>;
  }): Promise<PaginatedResult<{ messages: Message[] }>>;

  /**
   * Find a message by ID
   */
  findById(params: { messageId: string }): Promise<Message | null>;

  /**
   * Find paginated messages in a conversation (newer than a specific message number)
   */
  findPage(params: { conversationId: string; after?: number; limit?: number }): Promise<Message[]>;

  /**
   * Find latest messages in a conversation
   */
  findLatest(params: { conversationId: string; limit?: number }): Promise<Message[]>;

  /**
   * Create a message
   */
  create(params: { message: MessageCreateInput }): Promise<Message>;

  /**
   * Create messages
   */
  createMany(params: { messages: MessageCreateInput[] }): Promise<Message[]>;

  /**
   * Insert a message with full details
   */
  insertMessage(params: {
    conversationId: string;
    senderId: string;
    messageNumber: number;
    content: string;
    type?: string;
  }): Promise<Message>;

  /**
   * Atomically increments the conversation messageCounter and inserts the message.
   */
  atomicSendMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: string;
  }): Promise<Message>;

  /**
   * Update messages
   */
  updateMany(params: { filter: MessageFilter; message: Partial<Message> }): Promise<Message[]>;

  /**
   * Delete messages
   */
  deleteMany(params: { filter: MessageFilter }): Promise<void>;
}
