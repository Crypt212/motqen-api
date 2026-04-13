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
  sendImageMessage,
} from '../../controllers/ChatController.js';
import { authenticateAccess } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import { buildFilterSchema, createQuerySchema } from '../../schemas/common.js';
import upload from '../../configs/multer.js';
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
  [validateParams(ConversationIdParamsSchema), validateQuery(MissedMessagesQuerySchema)],
  getMissedMessages
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat/conversations/:conversationId/messages/image
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages/image:
 *   post:
 *     tags: [Chat]
 *     summary: Send an image message inside a conversation
 *     description: |
 *       Uploads an image file and creates a new IMAGE-type message in the
 *       specified conversation. The image is stored on Cloudinary and its
 *       URL is persisted as the message `content`.
 *
 *       **Constraints:**
 *       - Only participants of the conversation can send images
 *       - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
 *       - Maximum file size: **5 MB**
 *
 *       Send as `multipart/form-data` with a single `image` field.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         description: Conversation UUID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpeg, png, webp, or gif — max 5 MB)
 *     responses:
 *       201:
 *         description: Image message created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Image message sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       $ref: '#/components/schemas/Message'
 *             example:
 *               status: success
 *               message: Image message sent
 *               data:
 *                 message:
 *                   id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                   conversationId: 550e8400-e29b-41d4-a716-446655440000
 *                   senderId: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *                   messageNumber: 17
 *                   content: "https://res.cloudinary.com/.../chat-images/550e8400.../abc.jpg"
 *                   type: IMAGE
 *                   createdAt: "2026-04-04T08:00:00.000Z"
 *       400:
 *         description: |
 *           Bad Request — one of:
 *           - No image file provided
 *           - Invalid image type (not jpeg/png/webp/gif)
 *           - File exceeds 5 MB limit
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a participant in this conversation
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
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
