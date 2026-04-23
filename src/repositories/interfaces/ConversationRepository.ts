import {
  Conversation,
  ConversationCreateInput,
  ConversationFilter,
  ConversationParticipant,
  ConversationUpdateInput,
  ConversationWithParticipantsAndMessages,
} from '../../domain/conversation.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { IDType } from '../interfaces/Repository.js';

export default interface IConversationRepository {
  /**
   * Check if conversation exists
   */
  exists(params: { filter: ConversationFilter }): Promise<boolean>;

  /**
   * Find a conversation
   */
  find(params: { filter: ConversationFilter }): Promise<Conversation | null>;

  /**
   * Find a conversation by ID
   */
  findById(params: { id: IDType }): Promise<Conversation | null>;

  // /**
  //  * Find conversations
  //  */
  // findMany(params: { filter?: ConversationFilter }): Promise<Conversation[]>;

  /**
   * Find conversation between worker and client (unique constraint)
   */
  findByPair(params: { workerId: IDType; clientId: IDType; userId: IDType }): Promise<Conversation | null>;

  /**
   * Find conversation with participant
   */
  findWithParticipant(params: {
    conversationId: IDType;
    userId: IDType;
  }): Promise<ConversationWithParticipantsAndMessages | null>;

  /**
   * Find non empty conversations
   */
  findNonEmptyConversationsWithParticipantsAndMessages(params: {
    filter: ConversationFilter;
    userId: IDType;
    pagination?: PaginationOptions;
    sort?: SortOptions<ConversationWithParticipantsAndMessages>;
  }): Promise<
    PaginatedResultMeta & {
      conversationParticipantsWithMessages: ConversationWithParticipantsAndMessages[];
    }
  >;

  /**
   * Find conversations
   */
  findMany(params: {
    filter: ConversationFilter;
    userId: IDType;
    pagination?: PaginationOptions;
    sort?: SortOptions<ConversationWithParticipantsAndMessages>;
  }): Promise<
    PaginatedResultMeta & {
      conversationParticipantsWithMessages: ConversationWithParticipantsAndMessages[];
    }
  >;

  /**
   * Find conversation participant
   */
  findParticipant(params: {
    conversationId: IDType;
    userId: IDType;
  }): Promise<ConversationParticipant | null>;

  /**
   * Create a conversation
   */
  create(params: { conversation: ConversationCreateInput }): Promise<Conversation>;

  /**
   * Create conversation with participants
   */
  createWithParticipants(params: { workerId: IDType; clientId: IDType }): Promise<{
    conversation: Conversation;
    participants: ConversationParticipant[];
  }>;

  /**
   * Update a conversation
   */
  update(params: {
    filter: ConversationFilter;
    conversation: ConversationUpdateInput;
  }): Promise<Conversation>;

  /**
   * Update conversations
   */
  updateMany(params: {
    filter: ConversationFilter;
    conversation: ConversationUpdateInput;
  }): Promise<unknown>;

  /**
   * Increment message counter
   */
  incrementMessageCounter(params: { conversationId: IDType }): Promise<number>;

  /**
   * Delete a conversation
   */
  delete(params: { filter: ConversationFilter }): Promise<void>;

  /**
   * Delete conversations
   */
  deleteMany(params: { filter: ConversationFilter }): Promise<unknown>;

  /**
   * Update last read message number
   */
  updateLastRead(params: {
    conversationId: IDType;
    userId: IDType;
    messageNumber: number;
  }): Promise<ConversationParticipant>;

  /**
   * Update last received message number
   */
  updateLastReceived(params: {
    conversationId: IDType;
    userId: IDType;
    messageNumber: number;
  }): Promise<ConversationParticipant>;
}
