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
import { authorizeClient } from '../../middlewares/accessMiddleware.js';
import { z } from '../../libs/zod.js';
import {
  getOrCreateConversation,
  getConversations,
  getUnreadConversations,
  getMessages,
  getMissedMessages,
  sendImageMessage,
} from '../../controllers/ChatController.js';
import { authenticateAccess } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import { buildFilterSchema, createQuerySchema } from '../../schemas/common.js';
import upload from '../../configs/multer.js';

const chatRouter: Router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.post(
  '/conversations',
  authenticateAccess,
  authorizeClient,
  [validateBody(z.object({ partnerId: z.uuid({ message: 'partnerId must be a valid UUID' }) }))],
  getOrCreateConversation
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

const conversationListQuerySchema = createQuerySchema(
  buildFilterSchema({
    page: { type: 'number' as const, min: 1 },
    limit: { type: 'number' as const, min: 1, max: 30 },
    sortBy: { type: 'string' as const, enum: ['updatedAt', 'messageCounter', 'unreadCount'] },
    sortOrder: { type: 'string' as const, enum: ['asc', 'desc'] },
  })
);

chatRouter.get(
  '/conversations',
  authenticateAccess,
  [validateQuery(conversationListQuerySchema)],
  getConversations
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/unread  (backward-compatible alias)
// Must be registered BEFORE /conversations/:conversationId to avoid shadowing.
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/unread',
  authenticateAccess,
  [validateQuery(conversationListQuerySchema)],
  getUnreadConversations
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/:conversationId/messages
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/:conversationId/messages',
  authenticateAccess,
  [
    validateParams(
      z.object({ conversationId: z.uuid({ message: 'conversationId must be a valid UUID' }) })
    ),
    validateQuery(
      createQuerySchema(
        buildFilterSchema({
          after: { type: 'number' as const, min: 0 },
          limit: { type: 'number' as const, min: 1, max: 30 },
        })
      )
    ),
  ],
  getMessages
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/:conversationId/messages/missed
// Must be registered BEFORE /conversations/:conversationId/messages/:messageId
// to avoid route shadowing.
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/:conversationId/messages/missed',
  authenticateAccess,
  [
    validateParams(
      z.object({ conversationId: z.uuid({ message: 'conversationId must be a valid UUID' }) })
    ),
    validateQuery(
      z.object({
        // "after" is parsed as a string from query; the controller handles parseInt + validation.
        after: z
          .string({ message: 'after is required and must be a non-negative integer' })
          .regex(/^\d+$/, { message: 'after must be a non-negative integer' }),
        // "limit" is optional; controller enforces 1–100 clamping.
        limit: z
          .string()
          .regex(/^\d+$/, { message: 'limit must be a positive integer' })
          .optional(),
      })
    ),
  ],
  getMissedMessages
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat/conversations/:conversationId/upload-image
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.post(
  '/conversations/:conversationId/upload-image',
  authenticateAccess,
  [
    validateParams(
      z.object({ conversationId: z.uuid({ message: 'conversationId must be a valid UUID' }) })
    ),
    upload.single('image'),
  ],
  sendImageMessage
);

export default chatRouter;
