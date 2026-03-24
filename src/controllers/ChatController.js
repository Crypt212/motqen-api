/**
 * @fileoverview ChatController - HTTP handlers for chat REST endpoints
 * @module controllers/ChatController
 */

import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { chatService, conversationRepository } from '../state.js';
import { matchedData } from 'express-validator';
import { emitToUser } from '../socket/socket-emitter.js';
import AppError from '../errors/AppError.js';

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
  const { skip, take } = matchedData(req, { includeOptionals: true });

  const conversations = await chatService.getConversations({
    userId,
    skip,
    take,
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
  const { offset, limit } = matchedData(req, { includeOptionals: true });

  const conversations = await chatService.getConversations({
    userId,
    skip: offset,
    take: limit,
  });
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
  const { conversationId, after } = matchedData(req, { includeOptionals: true });

  const messages = await chatService.getMissedMessages({
    conversationId,
    userId,
    afterMessageNumber: after,
  });

  new SuccessResponse('Missed messages', { messages }, 200).send(res);
});

/**
 * POST /api/chat/conversations/:conversationId/upload-image
 * Upload an image and send it as a message in the conversation.
 * The image is uploaded to Cloudinary and the resulting URL is stored as
 * the message content with type IMAGE.
 *
 * Replicates the presence-check + delivery/read logic from the socket
 * send_message handler so the partner receives real-time events.
 */

export const uploadChatImage = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { conversationId } = matchedData(req, { includeOptionals: true });

  if (!req.file) throw new AppError('Image file is required', 400);

  // 1. Validate sender is a participant
  await chatService.validateParticipant({ conversationId, userId });

  // 2. Fetch conversation to identify the partner
  const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
  const partnerId = conv.participants.find((p) => p.userId !== userId)?.userId;

  // 3. Upload to Cloudinary + create the IMAGE message (atomic counter)
  const message = await chatService.sendImageMessage({
    conversationId,
    senderId: userId,
    imageBuffer: req.file.buffer,
  });

  // 4. Check recipient presence
  const presence = chatService.presence;
  const [delivered, recipientInChat] = await Promise.all([
    presence.isOnline({ userId: partnerId }),
    presence.isInChat({ conversationId, userId: partnerId }),
  ]);

  // 5. If recipient is online → mark as delivered
  if (delivered && partnerId) {
    await chatService.markAsDelivered({
      conversationId,
      userId: partnerId,
      messageNumber: message.messageNumber,
    });

    // Notify sender (via socket) that their message was delivered
    emitToUser(userId, 'messages_delivered', {
      conversationId,
      deliveredUpTo: message.messageNumber,
    });
  }

  // 6. If recipient is inside this chat → auto-mark as read
  if (recipientInChat) {
    await chatService.markAllAsRead({ conversationId, userId: partnerId });
  }

  // 7. Emit new_message to partner
  if (partnerId) {
    emitToUser(partnerId, 'new_message', { message, conversationId });
  }

  new SuccessResponse('Image message sent', { ...message }, 201).send(res);
});
