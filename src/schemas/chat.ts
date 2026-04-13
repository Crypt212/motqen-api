/**
 * @fileoverview Chat Zod schemas
 */

import { z } from '../libs/zod.js';
import { buildFilterSchema, createQuerySchema } from './common.js';

// ============================================
// Conversation schemas
// ============================================

export const CreateConversationSchema = z.object({
  workerId: z.uuid({ message: 'workerId must be a valid UUID' }),
});
export type CreateConversationDTO = z.infer<typeof CreateConversationSchema>;

export const ConversationIdParamsSchema = z.object({
  conversationId: z.uuid({ message: 'conversationId must be a valid UUID' }),
});
export type ConversationIdParams = z.infer<typeof ConversationIdParamsSchema>;

// ============================================
// Message schemas
// ============================================

export const MissedMessagesQuerySchema = z.object({
  after: z.int({ message: 'after is required and must be a non-negative integer' }).gte(0),
});
export type MissedMessagesQuery = z.infer<typeof MissedMessagesQuerySchema>;

// ============================================
// Query schemas
// ============================================

export const ConversationListQuerySchema = createQuerySchema(
  buildFilterSchema({
    skip: { type: 'number' as const, min: 0 },
    take: { type: 'number' as const, min: 1, max: 30 },
  })
);
export type ConversationListQuery = z.infer<typeof ConversationListQuerySchema>;

export const UnreadConversationQuerySchema = createQuerySchema(
  buildFilterSchema({
    page: { type: 'number' as const, min: 0 },
    limit: { type: 'number' as const, min: 1, max: 30 },
    sortBy: { type: 'string' as const, enum: ['updatedAt', 'messageCounter', 'unreadCount'] },
    sortOrder: { type: 'string' as const, enum: ['asc', 'desc'] },
  })
);
export type UnreadConversationQuery = z.infer<typeof UnreadConversationQuerySchema>;

export const MessageListQuerySchema = createQuerySchema(
  buildFilterSchema({
    after: { type: 'number' as const, min: 0 },
    limit: { type: 'number' as const, min: 1, max: 30 },
  })
);
export type MessageListQuery = z.infer<typeof MessageListQuerySchema>;
