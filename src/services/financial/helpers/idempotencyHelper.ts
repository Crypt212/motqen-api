import crypto from 'node:crypto';
import { Prisma } from '../../../generated/prisma/client.js';

/**
 * Generate a random idempotency key (UUID v4).
 * Used for operations where the key is system-generated (Payment, EscrowHold, etc.).
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Generate a deterministic idempotency key (SHA-256 hash) from the given inputs.
 * Used for TransactionLog entries and other operations so that re-executing 
 * a transaction after a rollback produces the exact same key.
 *
 * @param referenceType - Entity type name (e.g., "EscrowHold")
 * @param referenceId - Entity ID
 * @param entryType - Operation type string
 */
export function generateDeterministicKey(
  referenceType: string,
  referenceId: string,
  entryType: string,
): string {
  const input = `${referenceType}:${referenceId}:${entryType}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Check if a Prisma error is a unique constraint violation on `idempotency_key`.
 * Used by repository create methods to detect duplicate idempotency keys.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return error.code === 'P2002';
}
