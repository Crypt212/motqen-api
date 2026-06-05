/**
 * @fileoverview ChatController - HTTP handlers for chat REST endpoints
 * @module controllers/ChatController
 */

import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { chatService } from '../state.js';
import { matchedData } from 'express-validator';
import { IDType } from 'src/repositories/interfaces/Repository.js';
import { emitToUser } from '../socket/socket-emitter.js';

/**
 * POST /api/chat/conversations
 * Create or return the existing conversation between a Worker and a Client.
 * Request body: { workerId }
 * clientId is derived from authenticated user (req.userState.userId).
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { workerId } = req.body;
  const clientId = req.userState.userId;

  const conversation = await chatService.getOrCreateConversation({
    workerId,
    clientId,
  });

  new SuccessResponse('Conversation ready', { conversation }, 200).send(res);
});

/**
 * GET /api/chat/conversations
 * List all conversations for the authenticated user, with unread counts.
 * Query params: skip (offset), take (limit)
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { page, limit, sortBy, sortOrder } = matchedData(req, { includeOptionals: true });

  const conversations = await chatService.getConversations({
    userId,
    pagination: { page, limit },
    sort: [{ sortBy, sortOrder }],
  });

  new SuccessResponse('Conversations retrieved', conversations, 200).send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Paginated message history for a conversation.
 * Query params: after (messageNumber cursor), limit
 */
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { limit, after } = matchedData(req, { includeOptionals: true });
  const conversationId = req.params.conversationId as string;

  const result = await chatService.getMessages({
    conversationId,
    userId,
    after,
    limit,
  });
  new SuccessResponse('Messages retrieved', result, 200).send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages/missed
 * Fetch messages after a given messageNumber — used by client after receiving
 * a "missed_messages_available" socket event.
 * Query params: after (required — last known messageNumber)
 */
export const getMissedMessages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  let { after, limit } = req.query as { after: string; limit?: string };
  const conversationId = req.params.conversationId as string;

  const result = await chatService.getMissedMessages({
    conversationId,
    userId,
    afterMessageNumber: parseInt(after, 10),
    limit: limit ? Math.min(parseInt(limit, 10), 50) : 50,
  });

  new SuccessResponse('Missed messages', result, 200).send(res);
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

  // Emit socket event to partner
  const partnerId = await chatService.getPartnerIdCached({ conversationId, userId });
  if (partnerId) {
    emitToUser(partnerId, 'new_message', { message, conversationId });
  }

  new SuccessResponse('Image message sent', message, 201).send(res);
});
