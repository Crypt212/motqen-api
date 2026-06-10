/**
 * @fileoverview ChatController - HTTP handlers for chat REST endpoints
 * @module controllers/ChatController
 */

import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { chatService, conversationRepository } from '../state.js';
import { matchedData } from 'express-validator';
import { IDType } from 'src/repositories/interfaces/Repository.js';
import { emitToUser } from '../socket/socket-emitter.js';

/**
 * POST /api/chat/conversations
 * Create or return the existing conversation between a Worker and a Client.
 * The authenticated user's role determines which ID slot they fill.
 * - CLIENT: userId → clientId, body.partnerId → workerId
 * - WORKER: userId → workerId, body.partnerId → clientId
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { partnerId } = req.body;
  const { userId, role } = req.userState;

  if (partnerId === userId) {
    throw new AppError('Cannot create conversation with yourself', 400);
  }

  // role must be resolved — the authenticateAccess middleware sets it, but
  // guard here so we never pass undefined to the service.
  if (!role) {
    throw new AppError('User role could not be determined. Provide the x-user-type header', 400);
  }

  let workerId: IDType | undefined;
  let clientId: IDType | undefined;

  if (role === 'CLIENT' && req.userState.client) {
    workerId = partnerId;
    clientId = req.userState.userId;
  } else if (role === 'WORKER' && req.userState.worker) {
    workerId = req.userState.userId;
    clientId = partnerId;
  } else {
    throw new AppError('Invalid user role or missing client/worker profile association', 400);
  }

  const conversation = await chatService.getOrCreateConversation({
    workerId,
    clientId,
  });

  new SuccessResponse('Conversation ready', { conversation }, 200).send(res);
});

/**
 * GET /api/chat/conversations
 * List all conversations for the authenticated user, with unread counts.
 * Query params: page, limit, sortBy, sortOrder
 */
export const getConversations = asyncHandler(async (req, res) => {
  const { userId, role } = req.userState;
  const { page, limit, sortBy, sortOrder } = matchedData(req, { includeOptionals: true });

  // role must be set by authenticateAccess; guard defensively so callers
  // with a broken auth flow get a clear error instead of a service crash.
  if (!role) {
    throw new AppError('User role could not be determined. Provide the x-user-type header', 400);
  }

  const conversations = await chatService.getConversations({
    filter: { userId, role },
    pagination: { page, limit },
    sort: [{ sortBy, sortOrder }],
  });

  new SuccessResponse('Conversations retrieved', conversations, 200).send(res);
});

/**
 * GET /api/chat/conversations/unread
 * Backward-compatible alias — returns only conversations where unreadCount > 0.
 * Same response shape as GET /conversations but pre-filtered.
 * Query params: page, limit, sortBy, sortOrder
 */
export const getUnreadConversations = asyncHandler(async (req, res) => {
  const { userId, role } = req.userState;
  const { page, limit, sortBy, sortOrder } = matchedData(req, { includeOptionals: true });

  if (!role) {
    throw new AppError('User role could not be determined. Provide the x-user-type header', 400);
  }

  const result = await chatService.getConversations({
    filter: { userId, role },
    pagination: { page, limit },
    sort: [{ sortBy, sortOrder }],
  });

  // Filter to only conversations with at least one unread message.
  const unread = result.conversations.filter((c) => (c.unreadCount ?? 0) > 0);

  new SuccessResponse('Unread conversations retrieved', { unread }, 200).send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Paginated message history for a conversation.
 * Query params: after (messageNumber cursor), limit
 * Response shape: { messages: Message[] }
 */
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { limit, after } = matchedData(req, { includeOptionals: true });
  const conversationId = req.params.conversationId as string;

  const messages = await chatService.getMessages({
    conversationId,
    userId,
    after,
    limit,
  });

  new SuccessResponse('Messages retrieved', { messages }, 200).send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages/missed
 * Fetch messages after a given messageNumber — used by client after receiving
 * a "missed_messages_available" socket event.
 * Query params:
 *   - after (required) — last known messageNumber, non-negative integer
 *   - limit (optional) — max messages to return, 1–100, defaults to 100
 * Response shape: { messages: Message[] }
 */
export const getMissedMessages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const conversationId = req.params.conversationId as string;

  // Parse directly from query because this endpoint uses a raw z.object()
  // validator (not createQuerySchema), so matchedData keys differ.
  const rawAfter = req.query.after as string | undefined;
  const rawLimit = req.query.limit as string | undefined;

  if (!rawAfter) {
    throw new AppError('Query param "after" is required', 400);
  }

  const afterMessageNumber = parseInt(rawAfter, 10);
  if (!Number.isFinite(afterMessageNumber) || afterMessageNumber < 0) {
    throw new AppError('"after" must be a non-negative integer', 400);
  }

  // Clamp limit to [1, 100]. The documented contract says up to 100 messages.
  const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : 100;
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 100;

  const messages = await chatService.getMissedMessages({
    conversationId,
    userId,
    afterMessageNumber,
    limit,
  });

  new SuccessResponse('Missed messages', { messages }, 200).send(res);
});

/**
 * POST /api/chat/conversations/:conversationId/messages/image
 * Upload and send an image message in a conversation.
 * Request: multipart/form-data with a single "image" field
 * Requires authenticated user who is a participant in the conversation.
 */
export const sendImageMessage = asyncHandler(async (req, res) => {
  const userId = req.userState.userId as IDType;
  const conversationId = req.params.conversationId as IDType;
  const file = req.file;
  if (!file) {
    throw new AppError('No image file provided. Upload a file under the "image" field', 400);
  }

  const message = await chatService.sendImageMessage({
    conversationId,
    senderId: userId,
    imageBuffer: file.buffer,
  });

  // Emit socket event to partner (like regular text messages)
  const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
  const partner = conv.participants.find((p) => p.userId !== userId);
  if (partner) {
    emitToUser(partner.userId, 'new_message', { message, conversationId });
  }
  new SuccessResponse('Image message sent', message, 201).send(res);
});
