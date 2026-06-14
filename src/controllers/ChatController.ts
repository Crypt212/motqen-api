/**
 * @fileoverview ChatController - HTTP handlers for chat REST endpoints
 * @module controllers/ChatController
 */

import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { chatService, conversationRepository } from '../state.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { emitToUser } from '../socket/socket-emitter.js';
import { parseQuery } from '../schemas/common.js';
import {
  CreateConversationRequestDTO, CreateConversationQueryDTO, CreateConversationParamsDTO,
  GetConversationsRequestDTO, GetConversationsQueryDTO, GetConversationsParamsDTO,
  GetUnreadConversationsRequestDTO, GetUnreadConversationsQueryDTO, GetUnreadConversationsParamsDTO,
  GetMessagesRequestDTO, GetMessagesQueryDTO, GetMessagesParamsDTO,
  GetMissedMessagesRequestDTO, GetMissedMessagesQueryDTO, GetMissedMessagesParamsDTO,
  SendImageMessageRequestDTO, SendImageMessageQueryDTO, SendImageMessageParamsDTO
} from '../schemas/requests/chat.request.js';

export const getOrCreateConversation = asyncHandler<any, CreateConversationRequestDTO, CreateConversationQueryDTO, CreateConversationParamsDTO>(async (req, res) => {
  const { partnerId } = req.parsed!.body!;
  const { userId, role } = req.userState!;

  if (partnerId === userId) {
    throw new AppError('Cannot create conversation with yourself', 400);
  }

  if (!role) {
    throw new AppError('User role could not be determined. Provide the x-user-type header', 400);
  }

  let workerId: IDType | undefined;
  let clientId: IDType | undefined;

  if (role === 'CLIENT' && req.userState!.client) {
    workerId = partnerId;
    clientId = userId;
  } else if (role === 'WORKER' && req.userState!.worker) {
    workerId = userId;
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

export const getConversations = asyncHandler<any, GetConversationsRequestDTO, GetConversationsQueryDTO, GetConversationsParamsDTO>(async (req, res) => {
  const { userId, role } = req.userState!;
  const { filter, pagination, sort } = parseQuery(req.parsed!.query!);

  if (!role) {
    throw new AppError('User role could not be determined. Provide the x-user-type header', 400);
  }

  const conversations = await chatService.getConversations({
    filter: { userId, role },
    pagination,
    sort,
  });

  new SuccessResponse('Conversations retrieved', conversations, 200).send(res);
});

export const getUnreadConversations = asyncHandler<any, GetUnreadConversationsRequestDTO, GetUnreadConversationsQueryDTO, GetUnreadConversationsParamsDTO>(async (req, res) => {
  const { userId, role } = req.userState!;
  const { filter, pagination, sort } = parseQuery(req.parsed!.query!);

  if (!role) {
    throw new AppError('User role could not be determined. Provide the x-user-type header', 400);
  }

  const result = await chatService.getConversations({
    filter: { userId, role },
    pagination,
    sort,
  });

  const unread = result.conversations.filter((c) => (c.unreadCount ?? 0) > 0);

  new SuccessResponse('Unread conversations retrieved', { unread }, 200).send(res);
});

export const getMessages = asyncHandler<any, GetMessagesRequestDTO, GetMessagesQueryDTO, GetMessagesParamsDTO>(async (req, res) => {
  const userId = req.userState!.userId;
  const { filter, pagination } = parseQuery(req.parsed!.query!);
  const { conversationId } = req.parsed!.params!;

  const messages = await chatService.getMessages({
    conversationId,
    userId,
    after: filter.after,
    limit: pagination.limit,
  });

  new SuccessResponse('Messages retrieved', { messages }, 200).send(res);
});

export const getMissedMessages = asyncHandler<any, GetMissedMessagesRequestDTO, GetMissedMessagesQueryDTO, GetMissedMessagesParamsDTO>(async (req, res) => {
  const userId = req.userState!.userId;
  const { conversationId } = req.parsed!.params!;
  const { after, limit } = req.parsed!.query!;

  const afterMessageNumber = after;

  const messages = await chatService.getMissedMessages({
    conversationId,
    userId,
    afterMessageNumber,
    limit,
  });

  new SuccessResponse('Missed messages', { messages }, 200).send(res);
});

export const sendImageMessage = asyncHandler<any, SendImageMessageRequestDTO, SendImageMessageQueryDTO, SendImageMessageParamsDTO>(async (req, res) => {
  const userId = req.userState!.userId;
  const { conversationId } = req.parsed!.params!;
  const file = req.file;
  if (!file) {
    throw new AppError('No image file provided. Upload a file under the "image" field', 400);
  }

  const message = await chatService.sendImageMessage({
    conversationId,
    senderId: userId,
    imageBuffer: file.buffer,
  });

  const conv = await conversationRepository.findWithParticipant({ conversationId, userId });
  const partner = conv.participants.find((p) => p.userId !== userId);
  if (partner) {
    emitToUser(partner.userId, 'new_message', { message, conversationId });
  }
  new SuccessResponse('Image message sent', message, 201).send(res);
});
