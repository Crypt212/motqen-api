/**
 * @fileoverview ChatController - HTTP handlers for chat REST endpoints
 * @module controllers/ChatController
 */

import { matchedData } from 'express-validator';
import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { chatService } from '../state.js';

/**
 * POST /api/chat/conversations
 * Create or return the existing conversation between a Worker and a Client.
 * Request body: { workerId, clientId }
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { workerId, clientId } = matchedData(req, { includeOptionals: true });

  const conversation = await chatService.getOrCreateConversation({ workerId, clientId });

  new SuccessResponse('Conversation ready', { conversation }, 200).send(res);
});

/**
 * GET /api/chat/conversations
 * List all conversations for the authenticated user, with unread counts.
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const conversations = await chatService.getConversations({ userId });

  new SuccessResponse('Conversations retrieved', { conversations }, 200).send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Paginated message history for a conversation.
 * Query params: after (messageNumber cursor), limit
 */
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { conversationId } = req.params;
  const after = parseInt(req.query.after ?? '0', 10);
  const limit = Math.min(parseInt(req.query.limit ?? '30', 10), 100);

  const messages = await chatService.getMessages({ conversationId, userId, after, limit });

  new SuccessResponse('Messages retrieved', { messages }, 200).send(res);
});

/**
 * GET /api/chat/conversations/unread
 * App-open snapshot: all conversations with unread counts.
 * This is the HTTP sync endpoint used by the offline catch-up hybrid strategy.
 */
export const getUnreadSummary = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const conversations = await chatService.getConversations({ userId });
  const unread = conversations.filter((c) => c.unreadCount > 0);

  new SuccessResponse('Unread summary', { unread }, 200).send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages/missed
 * Fetch messages after a given messageNumber — used by client after receiving
 * a "missed_messages_available" socket event.
 * Query params: after (required — last known messageNumber)
 */
export const getMissedMessages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { conversationId } = req.params;
  const after = parseInt(req.query.after ?? '0', 10);

  const messages = await chatService.getMissedMessages({
    conversationId,
    userId,
    afterMessageNumber: after,
  });

  new SuccessResponse('Missed messages', { messages }, 200).send(res);
});
