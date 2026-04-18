/**
 * @fileoverview Reusable response schemas
 *
 * Every API response follows the shape:
 *   { status: 'success', message: string, data?: T }
 *
 * This module provides a helper to build those schemas once
 * and individual per-domain response schemas that docs can import.
 */

import { z } from '../libs/zod.js';

// ============================================
// Base response helpers
// ============================================

/** Wrap a data schema into the standard envelope. */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.literal('success'),
    message: z.string(),
    data: dataSchema,
  });

/** Success with no data payload (data: null). */
export const EmptySuccessResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string(),
  data: z.null(),
});

/** Success with only status + message (no data field). */
export const MessageOnlyResponseSchema = z.object({
  status: z.literal('success'),
  message: z.string(),
});

// ============================================
// Auth responses
// ============================================

export const RequestOTPResponseSchema = SuccessResponseSchema(
  z.object({
    phoneNumber: z.string().describe("e.g. '+201234567890'"),
    method: z.string().describe("e.g. 'SMS'"),
    cooldown: z.number().int().describe('Seconds before next request allowed'),
  })
);

export const VerifyOTPResponseSchema = SuccessResponseSchema(
  z.object({
    tokenType: z.enum(['login', 'register']),
    token: z.string().describe("e.g. 'eyJhbGciOiJI...'"),
  })
);

export const RegisterClientResponseSchema = SuccessResponseSchema(
  z.object({
    user: z.any().describe('User object'),
    clientProfile: z.any().describe('ClientProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const RegisterWorkerResponseSchema = SuccessResponseSchema(
  z.object({
    user: z.any().describe('User object'),
    workerProfile: z.any().describe('WorkerProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const LoginResponseSchema = SuccessResponseSchema(
  z.object({
    user: z.any().describe('User object'),
    refreshToken: z.string(),
    accessToken: z.string(),
  })
);

export const AccessTokenResponseSchema = SuccessResponseSchema(
  z.object({
    accessToken: z.string(),
  })
);

export const ReviewStatusResponseSchema = SuccessResponseSchema(z.any());

// ============================================
// Chat responses
// ============================================

export const ConversationResponseSchema = SuccessResponseSchema(
  z.object({
    conversation: z.any().describe('Conversation object'),
  })
);

export const ConversationListResponseSchema = SuccessResponseSchema(
  z.object({
    conversations: z.array(z.any().describe('ConversationSummary')),
  })
);

export const UnreadConversationListResponseSchema = SuccessResponseSchema(
  z.object({
    unread: z.array(z.any().describe('ConversationSummary')),
  })
);

export const MessageListResponseSchema = SuccessResponseSchema(
  z.object({
    messages: z.array(z.any().describe('Message')),
  })
);

// ============================================
// Dashboard responses
// ============================================

export const UserResponseSchema = SuccessResponseSchema(
  z.object({
    user: z.any().describe('User object'),
  })
);

export const WorkerProfileResponseSchema = SuccessResponseSchema(
  z.object({
    workerProfile: z.any().describe('WorkerProfile object'),
  })
);

export const ClientProfileResponseSchema = SuccessResponseSchema(
  z.object({
    clientProfile: z.any().describe('ClientProfile object'),
  })
);

export const WorkGovernmentsResponseSchema = SuccessResponseSchema(
  z.object({
    workGovernments: z.array(z.any().describe('Government')),
  })
);

export const SpecializationsResponseSchema = SuccessResponseSchema(
  z.object({
    specializations: z.array(z.any().describe('Specialization')),
  })
);

// ============================================
// Government responses
// ============================================

export const GovernmentResponseSchema = SuccessResponseSchema(
  z.object({
    government: z.any().describe('Government object'),
  })
);

export const GovernmentListResponseSchema = SuccessResponseSchema(
  z.object({
    governments: z.array(z.any().describe('Government')),
  })
);

export const CityListResponseSchema = SuccessResponseSchema(
  z.object({
    cities: z.array(z.any().describe('City')),
  })
);

// ============================================
// Specialization responses
// ============================================

export const SpecializationResponseSchema = SuccessResponseSchema(
  z.object({
    specialization: z.any().describe('Specialization object'),
  })
);

export const SpecializationListResponseSchema = SuccessResponseSchema(
  z.object({
    specializations: z.array(z.any().describe('Specialization')),
  })
);

export const SubSpecializationResponseSchema = SuccessResponseSchema(
  z.object({
    subSpecialization: z.any().describe('SubSpecialization object'),
  })
);

export const SubSpecializationListResponseSchema = SuccessResponseSchema(
  z.object({
    subSpecializations: z.array(z.any().describe('SubSpecialization')),
  })
);

// ============================================
// Worker (explore) responses
// ============================================

export const ExploreWorkersResponseSchema = SuccessResponseSchema(
  z.object({
    workers: z.array(z.any().describe('ExploreWorkerResult')),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    count: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    totalPages: z.number(),
  })
);

export const ExploreWorkerDetailResponseSchema = SuccessResponseSchema(
  z.any().describe('WorkerProfile')
);

// ============================================
// Negotiation responses
// ============================================

export const NegotiationResponseSchema = SuccessResponseSchema(z.any().describe('Negotiation'));

export const NegotiationListResponseSchema = SuccessResponseSchema(
  z.object({
    negotiations: z.array(z.any().describe('Negotiation')),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    count: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    totalPages: z.number(),
  })
);

// ============================================
// Order responses
// ============================================

export const OrderResponseSchema = SuccessResponseSchema(z.any().describe('Order'));
