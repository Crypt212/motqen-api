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
import { z } from '../../libs/zod.js';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  getUnreadSummary,
  getMissedMessages,
  sendImageMessage,
} from '../../controllers/ChatController.js';
import { authenticateAccess } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import { buildFilterSchema, createQuerySchema } from '../../schemas/common.js';
import upload from '../../configs/multer.js';

const chatRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.post(
  '/conversations',
  authenticateAccess,
  authorizeClient,
  [validateBody(z.object({ workerId: z.uuid({ message: 'workerId must be a valid UUID' }) }))],
  getOrCreateConversation
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations',
  [
    validateQuery(
      createQuerySchema(
        buildFilterSchema({
          skip: { type: 'number' as const, min: 0 },
          take: { type: 'number' as const, min: 1, max: 30 },
        })
      )
    ),
  ],
  getConversations
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/unread
// (Must be registered BEFORE /:conversationId routes to avoid param capture)
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/unread',
  [
    validateQuery(
      createQuerySchema(
        buildFilterSchema({
          page: { type: 'number' as const, min: 0 },
          limit: { type: 'number' as const, min: 1, max: 30 },
          sortBy: { type: 'string' as const, enum: ['updatedAt', 'messageCounter', 'unreadCount'] },
          sortOrder: { type: 'string' as const, enum: ['asc', 'desc'] },
        })
      )
    ),
  ],
  getUnreadSummary
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/:conversationId/messages
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/:conversationId/messages',
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
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.get(
  '/conversations/:conversationId/messages/missed',
  [
    validateParams(
      z.object({ conversationId: z.uuid({ message: 'conversationId must be a valid UUID' }) })
    ),
    validateQuery(
      z.object({
        after: z.string({ message: 'after is required and must be a non-negative integer' }),
      })
    ),
  ],
  getMissedMessages
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat/conversations/:conversationId/messages/image
// ─────────────────────────────────────────────────────────────────────────────

chatRouter.post(
  '/conversations/:conversationId/upload-image',
  [
    validateParams(
      z.object({ conversationId: z.uuid({ message: 'conversationId must be a valid UUID' }) })
    ),
    upload.single('image'),
  ],
  sendImageMessage
);

export default chatRouter;
