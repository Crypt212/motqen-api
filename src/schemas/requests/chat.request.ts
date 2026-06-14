import { z } from '../../libs/zod.js';
import { createFilterMetadata, createQuerySchema, UUIDSchema, EmptySchema } from '../common.js';

export const CreateConversationSchema = z.object({
  partnerId: UUIDSchema,
});
export type CreateConversationDTO = z.infer<typeof CreateConversationSchema>;

export const ConversationIdParamsSchema = z.object({
  conversationId: UUIDSchema,
});
export type ConversationIdParams = z.infer<typeof ConversationIdParamsSchema>;

export const MissedMessagesQuerySchema = z.object({
  after: z.coerce.number().int({ message: 'after is required and must be a non-negative integer' }).gte(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
});
export type MissedMessagesQuery = z.infer<typeof MissedMessagesQuerySchema>;

export const ConversationListQuerySchema = createQuerySchema(
  createFilterMetadata({
    userId: UUIDSchema.optional(),
    role: z.enum(['CLIENT', 'WORKER']).optional(),
    updatedAt: z.any().optional(),
    messageCounter: z.any().optional(),
    unreadCount: z.any().optional(),
  }, { sortableFields: ['updatedAt', 'messageCounter', 'unreadCount'] })
);
export type ConversationListQuery = z.infer<typeof ConversationListQuerySchema>;

export const UnreadConversationQuerySchema = ConversationListQuerySchema;
export type UnreadConversationQuery = z.infer<typeof UnreadConversationQuerySchema>;

export const MessageListQuerySchema = createQuerySchema(
  createFilterMetadata({
    after: z.coerce.number().min(0).optional(),
  }, { sortableFields: [] })
);
export type MessageListQuery = z.infer<typeof MessageListQuerySchema>;

// --- Quartets ---

export const CreateConversationRequestSchema = CreateConversationSchema;
export type CreateConversationRequestDTO = z.infer<typeof CreateConversationRequestSchema>;
export const CreateConversationQuerySchema = EmptySchema;
export type CreateConversationQueryDTO = z.infer<typeof CreateConversationQuerySchema>;
export const CreateConversationParamsSchema = EmptySchema;
export type CreateConversationParamsDTO = z.infer<typeof CreateConversationParamsSchema>;

export const GetConversationsRequestSchema = EmptySchema;
export type GetConversationsRequestDTO = z.infer<typeof GetConversationsRequestSchema>;
export const GetConversationsQuerySchema = ConversationListQuerySchema;
export type GetConversationsQueryDTO = z.infer<typeof GetConversationsQuerySchema>;
export const GetConversationsParamsSchema = EmptySchema;
export type GetConversationsParamsDTO = z.infer<typeof GetConversationsParamsSchema>;

export const GetUnreadConversationsRequestSchema = EmptySchema;
export type GetUnreadConversationsRequestDTO = z.infer<typeof GetUnreadConversationsRequestSchema>;
export const GetUnreadConversationsQuerySchema = UnreadConversationQuerySchema;
export type GetUnreadConversationsQueryDTO = z.infer<typeof GetUnreadConversationsQuerySchema>;
export const GetUnreadConversationsParamsSchema = EmptySchema;
export type GetUnreadConversationsParamsDTO = z.infer<typeof GetUnreadConversationsParamsSchema>;

export const GetMessagesRequestSchema = EmptySchema;
export type GetMessagesRequestDTO = z.infer<typeof GetMessagesRequestSchema>;
export const GetMessagesQuerySchema = MessageListQuerySchema;
export type GetMessagesQueryDTO = z.infer<typeof GetMessagesQuerySchema>;
export const GetMessagesParamsSchema = ConversationIdParamsSchema;
export type GetMessagesParamsDTO = z.infer<typeof GetMessagesParamsSchema>;

export const GetMissedMessagesRequestSchema = EmptySchema;
export type GetMissedMessagesRequestDTO = z.infer<typeof GetMissedMessagesRequestSchema>;
export const GetMissedMessagesQuerySchema = MissedMessagesQuerySchema;
export type GetMissedMessagesQueryDTO = z.infer<typeof GetMissedMessagesQuerySchema>;
export const GetMissedMessagesParamsSchema = ConversationIdParamsSchema;
export type GetMissedMessagesParamsDTO = z.infer<typeof GetMissedMessagesParamsSchema>;

export const SendImageMessageRequestSchema = EmptySchema;
export type SendImageMessageRequestDTO = z.infer<typeof SendImageMessageRequestSchema>;
export const SendImageMessageQuerySchema = EmptySchema;
export type SendImageMessageQueryDTO = z.infer<typeof SendImageMessageQuerySchema>;
export const SendImageMessageParamsSchema = ConversationIdParamsSchema;
export type SendImageMessageParamsDTO = z.infer<typeof SendImageMessageParamsSchema>;
