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
