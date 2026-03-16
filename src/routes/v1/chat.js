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
import { body, param, query } from 'express-validator';
import { validateRequest } from '../../middlewares/validateRequest.js';

import { authorizeClient } from '../../middlewares/clientMiddleware.js';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  getUnreadSummary,
  getMissedMessages,
} from '../../controllers/ChatController.js';
import { authenticateAccess } from '../../middlewares/authMiddleware.js';

const chatRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/conversations:
 *   post:
 *     tags: [Chat]
 *     summary: Get or create a conversation between a Worker and a Client
 *     description: |
 *       Idempotent — returns the existing conversation if one already exists for
 *       the given Worker + Client pair. Creates a new one otherwise.
 *
 *       **Business rules:**
 *       - Only Worker ↔ Client pairs are allowed (enforced at DB level)
 *       - `workerId` must belong to a user with a `WorkerProfile`
 *       - `clientId` must belong to a user with a `ClientProfile`
 *       - A user cannot start a conversation with themselves
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workerId]
 *             properties:
 *               workerId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *                 description: UUID of the user who has a WorkerProfile
 *     responses:
 *       200:
 *         description: Conversation ready (existing or newly created)
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
 *                   example: Conversation ready
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversation:
 *                       $ref: '#/components/schemas/Conversation'
 *             example:
 *               status: success
 *               message: Conversation ready
 *               data:
 *                 conversation:
 *                   id: 550e8400-e29b-41d4-a716-446655440000
 *                   workerId: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *                   clientId: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *                   messageCounter: 0
 *                   createdAt: "2026-03-01T17:00:00.000Z"
 *                   updatedAt: "2026-03-01T17:00:00.000Z"
 *       400:
 *         description: |
 *           Bad Request — one of:
 *           - `workerId` has no WorkerProfile
 *           - `clientId` has no ClientProfile
 *           - `workerId` === `clientId` (self-conversation)
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
chatRouter.post(
  '/conversations',
  authenticateAccess,
  authorizeClient,
  [
    body('workerId').isUUID().withMessage('workerId must be a valid UUID'),
  ],
  validateRequest,
  getOrCreateConversation,
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/conversations:
 *   get:
 *     tags: [Chat]
 *     summary: List all conversations for the authenticated user
 *     description: |
 *       Returns all conversations the authenticated user participates in,
 *       ordered by most recently updated. Each item includes:
 *       - `unreadCount` — derived as `messageCounter − lastReadMessageNumber` (O(1), no COUNT query)
 *       - `lastMessage` — the most recent message in the conversation (for preview)
 *       - `partner` — the other participant's public info (name, avatar, isOnline)
 *
 *       This is the **app-open HTTP sync** endpoint; call it on cold start before
 *       connecting to Socket.IO.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *         description: Number of conversations to skip (offset-based pagination)
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 30
 *           example: 30
 *         description: Number of conversations to return (max 100)
 *     responses:
 *       200:
 *         description: List of conversations with unread counts
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
 *                   example: Conversations retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ConversationSummary'
 *             example:
 *               status: success
 *               message: Conversations retrieved
 *               data:
 *                 conversations:
 *                   - id: 550e8400-e29b-41d4-a716-446655440000
 *                     messageCounter: 10
 *                     unreadCount: 3
 *                     partnerLastReceivedMessageNumber: 8
 *                     partnerLastReadMessageNumber: 6
 *                     lastMessage:
 *                       id: abc123
 *                       messageNumber: 10
 *                       content: "متى تبدأ؟"
 *                       type: TEXT
 *                       createdAt: "2026-03-01T17:00:00.000Z"
 *                     partner:
 *                       id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *                       firstName: أحمد
 *                       lastName: محمد
 *                       profileImageUrl: null
 *                       isOnline: true
 *                     updatedAt: "2026-03-01T17:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
chatRouter.get(
  '/conversations',
  [
    query('skip').optional().isInt({ min: 0 }).toInt(),
    query('take').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  getConversations,
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/unread
// (Must be registered BEFORE /:conversationId routes to avoid param capture)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/conversations/unread:
 *   get:
 *     tags: [Chat]
 *     summary: Unread conversations snapshot (offline sync)
 *     description: |
 *       Returns only the conversations that have unread messages
 *       (`unreadCount > 0`). Same shape as `GET /conversations` but filtered.
 *
 *       **Use case:** app-open badge count or notification summary without
 *       loading all conversations.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *         description: Number of conversations to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 30
 *           example: 30
 *         description: Max conversations to return (max 100)
 *     responses:
 *       200:
 *         description: Conversations with at least one unread message
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
 *                   example: Unread summary
 *                 data:
 *                   type: object
 *                   properties:
 *                     unread:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ConversationSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
chatRouter.get(
  '/conversations/unread',
  [
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  getUnreadSummary,
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/:conversationId/messages
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Paginated message history (cursor-based by messageNumber)
 *     description: |
 *       Returns a page of messages in **ascending order** (oldest first in page).
 *       Uses `messageNumber` as the cursor for stable pagination — no drift under
 *       concurrent inserts unlike offset-based paging.
 *
 *       **How to paginate:**
 *       1. First load: omit `after` (or `after=0`) → returns oldest messages
 *       2. Next page: pass `after` = last `messageNumber` from previous response
 *       3. Stop when fewer than `limit` messages are returned
 *
 *       Only accessible by participants of the conversation.
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
 *       - in: query
 *         name: after
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 15
 *         description: Cursor — fetch messages with `messageNumber > after`
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 30
 *           example: 30
 *         description: Number of messages per page (max 100)
 *     responses:
 *       200:
 *         description: Page of messages in ascending order
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
 *                   example: Messages retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *             example:
 *               status: success
 *               message: Messages retrieved
 *               data:
 *                 messages:
 *                   - id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                     conversationId: 550e8400-e29b-41d4-a716-446655440000
 *                     senderId: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *                     messageNumber: 16
 *                     content: "متى تبدأ؟"
 *                     type: TEXT
 *                     createdAt: "2026-03-01T17:00:00.000Z"
 *                     sender:
 *                       id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
 *                       firstName: أحمد
 *                       lastName: محمد
 *                       profileImageUrl: null
 *                       isOnline: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a participant in this conversation
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
chatRouter.get(
  '/conversations/:conversationId/messages',
  [
    param('conversationId').isUUID().withMessage('conversationId must be a valid UUID'),
    query('after').optional().isInt({ min: 0 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  getMessages,
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /chat/conversations/:conversationId/messages/missed
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /chat/conversations/{conversationId}/messages/missed:
 *   get:
 *     tags: [Chat]
 *     summary: Fetch missed messages after socket reconnect
 *     description: |
 *       Called by the client **after receiving a `missed_messages_available`
 *       socket event** on reconnect.
 *
 *       **Offline sync flow:**
 *       1. Socket reconnects → server emits `missed_messages_available { conversationId, unreadCount }`
 *       2. Client calls this endpoint with `after = lastKnownMessageNumber`
 *       3. Server returns all messages with `messageNumber > after` (up to 100)
 *       4. Client deduplicates by `messageNumber` if needed
 *
 *       This keeps the socket channel clean (no bulk push) while ensuring
 *       reliable delivery via HTTP.
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
 *       - in: query
 *         name: after
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 7
 *         description: Last known `messageNumber` — server returns everything after this
 *     responses:
 *       200:
 *         description: Missed messages since `after` (max 100, ascending order)
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
 *                   example: Missed messages
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       400:
 *         description: "`after` query param is missing or not a valid integer"
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a participant in this conversation
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
chatRouter.get(
  '/conversations/:conversationId/messages/missed',
  [
    param('conversationId').isUUID().withMessage('conversationId must be a valid UUID'),
    query('after').isInt({ min: 0 }).toInt().withMessage('after is required and must be a non-negative integer'),
  ],
  validateRequest,
  getMissedMessages,
);

export default chatRouter;
