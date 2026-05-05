import { z } from 'zod';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const UserMinimalSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable().optional(),
});

export const ConversationObjectSchema = z.object({
  id: z.string().uuid(),
  messageCounter: z.number(),
  unreadCount: z.number().optional(),
  partner: UserMinimalSchema.nullable().optional(),
  partnerLastReceivedMessageNumber: z.number().optional(),
  partnerLastReadMessageNumber: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MessageObjectSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  messageNumber: z.number(),
  content: z.string(),
  type: z.enum(['TEXT', 'IMAGE']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ConversationResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    conversation: ConversationObjectSchema,
  }),
});

export const ConversationListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    conversations: z.array(ConversationObjectSchema),
  }),
});

export const MessageListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    messages: z.array(MessageObjectSchema),
  }),
});

export const UnreadConversationListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    unread: z.array(z.any()), // Can be refined further based on exact unread payload
  }),
});

export const MessageResponseSchema = BaseSuccessResponse.extend({
  data: MessageObjectSchema, // or z.object({ message: MessageObjectSchema }) based on controller
});
