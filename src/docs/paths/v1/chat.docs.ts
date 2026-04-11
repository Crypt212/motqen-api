import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateConversationSchema,
  ConversationIdParamsSchema,
  MissedMessagesQuerySchema,
  ConversationListQuerySchema,
  UnreadConversationQuerySchema,
  MessageListQuerySchema,
} from '../../../schemas/chat.js';
import {
  ConversationResponseSchema,
  ConversationListResponseSchema,
  UnreadConversationListResponseSchema,
  MessageListResponseSchema,
} from '../../../schemas/responses.js';

export default function registerChatDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /chat/conversations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/chat/conversations',
    tags: ['Chat'],
    summary: 'Get or create a conversation between a Worker and a Client',
    description:
      'Idempotent — returns the existing conversation if one already exists for the given Worker + Client pair. Creates a new one otherwise. Only Worker ↔ Client pairs are allowed. A user cannot start a conversation with themselves.',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateConversationSchema } },
      },
    },
    responses: {
      200: {
        description: 'Conversation ready (existing or newly created)',
        content: { 'application/json': { schema: ConversationResponseSchema } },
      },
      400: { description: 'Bad Request — invalid workerId, clientId, or self-conversation' },
      401: { description: 'Unauthorized' },
      422: { description: 'Validation Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /chat/conversations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/chat/conversations',
    tags: ['Chat'],
    summary: 'List all conversations for the authenticated user',
    description:
      'Returns all conversations the authenticated user participates in, ordered by most recently updated. Each item includes unreadCount, lastMessage preview, and partner public info. This is the app-open HTTP sync endpoint.',
    security: [{ BearerAuth: [] }],
    request: {
      query: ConversationListQuerySchema,
    },
    responses: {
      200: {
        description: 'List of conversations with unread counts',
        content: { 'application/json': { schema: ConversationListResponseSchema } },
      },
      401: { description: 'Unauthorized' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /chat/conversations/unread
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/chat/conversations/unread',
    tags: ['Chat'],
    summary: 'Unread conversations snapshot (offline sync)',
    description:
      'Returns only conversations with unread messages (unreadCount > 0). Same shape as GET /conversations but filtered. Use for app-open badge count or notification summary.',
    security: [{ BearerAuth: [] }],
    request: {
      query: UnreadConversationQuerySchema,
    },
    responses: {
      200: {
        description: 'Conversations with at least one unread message',
        content: { 'application/json': { schema: UnreadConversationListResponseSchema } },
      },
      401: { description: 'Unauthorized' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /chat/conversations/:conversationId/messages
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/chat/conversations/{conversationId}/messages',
    tags: ['Chat'],
    summary: 'Paginated message history (cursor-based by messageNumber)',
    description:
      'Returns a page of messages in ascending order (oldest first). Uses messageNumber as the cursor for stable pagination. Only accessible by participants of the conversation.',
    security: [{ BearerAuth: [] }],
    request: {
      params: ConversationIdParamsSchema,
      query: MessageListQuerySchema,
    },
    responses: {
      200: {
        description: 'Page of messages in ascending order',
        content: { 'application/json': { schema: MessageListResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Not a participant in this conversation' },
      404: { description: 'Not Found' },
      422: { description: 'Validation Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /chat/conversations/:conversationId/messages/missed
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/chat/conversations/{conversationId}/messages/missed',
    tags: ['Chat'],
    summary: 'Fetch missed messages after socket reconnect',
    description:
      'Called by the client after receiving a `missed_messages_available` socket event on reconnect. Returns all messages with messageNumber > after (up to 100).',
    security: [{ BearerAuth: [] }],
    request: {
      params: ConversationIdParamsSchema,
      query: MissedMessagesQuerySchema,
    },
    responses: {
      200: {
        description: 'Missed messages since `after` (max 100, ascending order)',
        content: { 'application/json': { schema: MessageListResponseSchema } },
      },
      400: { description: '`after` query param is missing or not a valid integer' },
      401: { description: 'Unauthorized' },
      403: { description: 'Not a participant in this conversation' },
      422: { description: 'Validation Error' },
    },
  });
}
