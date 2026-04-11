/**
 * @fileoverview Chat Routes - REST endpoints for conversation management and message history
 * @module routes/chat
 *
 * All routes require:
 *   - x-device-fingerprint header (applied globally at /api level)
 *   - Authorization: Bearer <access_token>
 *   - User account must be ACTIVE
 *
 * Base path: /chat
 */

import { Router } from 'express';
import { authorizeClient } from '../../middlewares/clientMiddleware.js';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  getUnreadSummary,
  getMissedMessages,
} from '../../controllers/ChatController.js';
import { authenticateAccess } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import {
  CreateConversationSchema,
  ConversationIdParamsSchema,
  MissedMessagesQuerySchema,
  ConversationListQuerySchema,
  UnreadConversationQuerySchema,
  MessageListQuerySchema,
} from '../../schemas/chat.js';

const chatRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.post(
  '/conversations',
  authenticateAccess,
  authorizeClient,
  [validateBody(CreateConversationSchema)],
  getOrCreateConversation
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get('/conversations', [validateQuery(ConversationListQuerySchema)], getConversations);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/unread
// (Must be registered BEFORE /:conversationId routes to avoid param capture)
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/unread',
  [validateQuery(UnreadConversationQuerySchema)],
  getUnreadSummary
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/:conversationId/messages
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/:conversationId/messages',
  [validateParams(ConversationIdParamsSchema), validateQuery(MessageListQuerySchema)],
  getMessages
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/:conversationId/messages/missed
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/:conversationId/messages/missed',
  [validateParams(ConversationIdParamsSchema), validateQuery(MissedMessagesQuerySchema)],
  getMissedMessages
);

export default chatRouter;
