/**
 * @fileoverview ChatController - HTTP handlers for chat REST endpoints
 * @module controllers/ChatController
 */

import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { chatService } from '../state.js';
import { matchedData } from 'express-validator';

/**
 * POST /api/chat/conversations
 * Create or return the existing conversation between a Worker and a Client.
 * Request body: { workerId }
 * clientId is derived from authenticated user (req.userState.userId).
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { workerId } = matchedData(req, { includeOptionals: true });
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
    sort: { sortBy, sortOrder },
  });

  new SuccessResponse('Conversations retrieved', { conversations }, 200).send(res);
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Paginated message history for a conversation.
 * Query params: after (messageNumber cursor), limit
 */
export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { conversationId, limit, after } = matchedData(req, { includeOptionals: true });

  const messages = await chatService.getMessages({
    conversationId,
    userId,
    after,
    limit,
  });

  new SuccessResponse('Messages retrieved', { messages }, 200).send(res);
});

/**
 * GET /api/chat/conversations/unread
 * App-open snapshot: all conversations with unread counts.
 * Query params: offset, limit
 */
export const getUnreadSummary = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { page, limit, sortBy, sortOrder } = matchedData(req, { includeOptionals: true });

  const conversations = await chatService.getConversations({
    userId,
    pagination: { page, limit },
    sort: { sortBy, sortOrder },
  });
  const unread = conversations.conversationsWithParticipantsAndMessages.filter((c) => {
    const myParticipant = c.participants.find((p) => p.userId === userId);
    const unreadCount = c.messageCounter - (myParticipant?.lastReadMessageNumber ?? 0);
    return unreadCount > 0;
  });

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
  const { conversationId, after } = matchedData(req, { includeOptionals: true });

  const messages = await chatService.getMissedMessages({
    conversationId,
    userId,
    afterMessageNumber: after,
  });

  new SuccessResponse('Missed messages', { messages }, 200).send(res);
});
