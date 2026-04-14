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
import { createResponseDoc } from '../../../docs/common.js';

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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateConversationSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Conversation ready (existing or newly created)',
        content: { 'application/json': { schema: ConversationResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      validationErrorResponse: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: ConversationListQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of conversations with unread counts',
        content: { 'application/json': { schema: ConversationListResponseSchema } },
      },
      unauthorizedResponse: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: UnreadConversationQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Conversations with at least one unread message',
        content: { 'application/json': { schema: UnreadConversationListResponseSchema } },
      },
      unauthorizedResponse: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: ConversationIdParamsSchema,
      query: MessageListQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Page of messages in ascending order',
        content: { 'application/json': { schema: MessageListResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: ConversationIdParamsSchema,
      query: MissedMessagesQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Missed messages since `after` (max 100, ascending order)',
        content: { 'application/json': { schema: MessageListResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
    }),
  });
}
