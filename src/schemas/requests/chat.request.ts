import { z } from '../../libs/zod.js';
import { createFilterMetadata, createQuerySchema } from '../common.js';

export const CreateConversationSchema = z.object({
  workerId: z.string().uuid({ message: 'workerId must be a valid UUID' }),
});
export type CreateConversationDTO = z.infer<typeof CreateConversationSchema>;

export const ConversationIdParamsSchema = z.object({
  conversationId: z.string().uuid({ message: 'conversationId must be a valid UUID' }),
});
export type ConversationIdParams = z.infer<typeof ConversationIdParamsSchema>;

export const MissedMessagesQuerySchema = z.object({
  after: z.coerce.number().int({ message: 'after is required and must be a non-negative integer' }).gte(0),
});
export type MissedMessagesQuery = z.infer<typeof MissedMessagesQuerySchema>;

export const ConversationListQuerySchema = createQuerySchema(
  createFilterMetadata({
    skip: z.coerce.number().min(0),
    take: z.coerce.number().min(1).max(30),
  })
);
export type ConversationListQuery = z.infer<typeof ConversationListQuerySchema>;

export const UnreadConversationQuerySchema = createQuerySchema(
  createFilterMetadata({
    page: z.coerce.number().min(0),
    limit: z.coerce.number().min(1).max(30),
    sortBy: z.enum(['updatedAt', 'messageCounter', 'unreadCount']),
    sortOrder: z.enum(['asc', 'desc']),
  })
);
export type UnreadConversationQuery = z.infer<typeof UnreadConversationQuerySchema>;

export const MessageListQuerySchema = createQuerySchema(
  createFilterMetadata({
    after: z.coerce.number().min(0),
    limit: z.coerce.number().min(1).max(30),
  })
);
export type MessageListQuery = z.infer<typeof MessageListQuerySchema>;
