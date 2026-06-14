import { Router } from 'express';
import { authorizeClient } from '../../middlewares/accessMiddleware.js';
import {
  getOrCreateConversation,
  getConversations,
  getUnreadConversations,
  getMessages,
  getMissedMessages,
  sendImageMessage,
} from '../../controllers/ChatController.js';
import { authenticateAccess } from '../../middlewares/authMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';
import {
  CreateConversationRequestSchema,
  CreateConversationQuerySchema,
  CreateConversationParamsSchema,
  GetConversationsRequestSchema,
  GetConversationsQuerySchema,
  GetConversationsParamsSchema,
  GetUnreadConversationsRequestSchema,
  GetUnreadConversationsQuerySchema,
  GetUnreadConversationsParamsSchema,
  GetMessagesRequestSchema,
  GetMessagesQuerySchema,
  GetMessagesParamsSchema,
  GetMissedMessagesRequestSchema,
  GetMissedMessagesQuerySchema,
  GetMissedMessagesParamsSchema,
  SendImageMessageRequestSchema,
  SendImageMessageQuerySchema,
  SendImageMessageParamsSchema,
} from '../../schemas/requests/chat.request.js';
import upload from '../../configs/multer.js';

const chatRouter: Router = Router();

chatRouter.post(
  '/conversations',
  authenticateAccess,
  authorizeClient,
  createRoute({
    schemas: {
      body: CreateConversationRequestSchema,
      query: CreateConversationQuerySchema,
      params: CreateConversationParamsSchema,
    },
    handler: getOrCreateConversation,
  })
);

chatRouter.get(
  '/conversations',
  authenticateAccess,
  createRoute({
    schemas: {
      body: GetConversationsRequestSchema,
      query: GetConversationsQuerySchema,
      params: GetConversationsParamsSchema,
    },
    handler: getConversations,
  })
);

chatRouter.get(
  '/conversations/unread',
  authenticateAccess,
  createRoute({
    schemas: {
      body: GetUnreadConversationsRequestSchema,
      query: GetUnreadConversationsQuerySchema,
      params: GetUnreadConversationsParamsSchema,
    },
    handler: getUnreadConversations,
  })
);

chatRouter.get(
  '/conversations/:conversationId/messages',
  authenticateAccess,
  createRoute({
    schemas: {
      body: GetMessagesRequestSchema,
      query: GetMessagesQuerySchema,
      params: GetMessagesParamsSchema,
    },
    handler: getMessages,
  })
);

chatRouter.get(
  '/conversations/:conversationId/messages/missed',
  authenticateAccess,
  createRoute({
    schemas: {
      body: GetMissedMessagesRequestSchema,
      query: GetMissedMessagesQuerySchema,
      params: GetMissedMessagesParamsSchema,
    },
    handler: getMissedMessages,
  })
);

chatRouter.post(
  '/conversations/:conversationId/upload-image',
  authenticateAccess,
  upload.single('image'),
  createRoute({
    schemas: {
      body: SendImageMessageRequestSchema,
      query: SendImageMessageQuerySchema,
      params: SendImageMessageParamsSchema,
    },
    handler: sendImageMessage,
  })
);

export default chatRouter;
