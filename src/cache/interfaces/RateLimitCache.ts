import { Method } from '../../domain/otp.entity.js';
import { IDType } from '../../repositories/interfaces/Repository.js';

/**
 * Result object for increment operations
 */
export type IncrementResult = {
  attempts: number;
  cooldown: number;
};

/**
 * Result object for device count operations
 */
export type DeviceCountResult = {
  deviceCount: number;
};

export default interface IRateLimitCache {
  // ─── Send ───────────────────────────────────────────────────────────────────

  /**
   * Check if send OTP is on cooldown for phone/method
   */
  isSendOnCooldown(phone: string, method: Method): Promise<boolean>;

  /**
   * Check if send OTP is on cooldown for device
   */
  isDeviceOnCooldown(deviceId: string): Promise<boolean>;

  /**
   * Get the TTL of send cooldown for phone or device
   */
  getSendCooldownTTL(phone: string, method: Method, deviceId: string): Promise<number>;

  /**
   * Increment send attempt counter for phone/method and device
   */
  incrementSend(phone: string, method: Method, deviceId: IDType): Promise<IncrementResult>;

  // ─── Verify ──────────────────────────────────────────────────────────────────

  /**
   * Get verification attempts for phone/method
   */
  getVerifyAttempts(phone: string, method: Method): Promise<number>;

  /**
   * Increment verification attempt counter
   */
  incrementVerify(phone: string, method: Method): Promise<IncrementResult>;
  /**
   * Reset verification attempts for phone/method
   */
  resetVerifyAttempts(phone: string, method: Method): Promise<void>;

  // ─── Verified ────────────────────────────────────────────────────────────────

  /**
   * Set phone as verified with TTL
   */
  setVerified(phone: string, ttlSeconds: number): Promise<void>;

  /**
   * Check if phone is verified
   */
  isVerified(phone: string): Promise<boolean>;

  /**
   * Delete verified status for phone
   */
  deleteVerified(phone: string): Promise<number>;

  // ─── Accounts ────────────────────────────────────────────────────────────────

  /**
   * Increment account creation attempts for device
   */
  incrementAccounts(deviceId: IDType, ttlSeconds: number): Promise<DeviceCountResult>;

  /**
   * Get account creation attempts for device
   */
  getAccountsAttempts(deviceId: IDType): Promise<DeviceCountResult>;

  // ─── Reset ─────────────────────────────────────────────────────────────────

  /**
   * Reset rate limit state after successful verification
   */
  resetAfterSuccess(phone: string, method: Method, deviceId: IDType): Promise<void>;

  // ─── Socket ────────────────────────────────────────────────────────────────

  /**
   * Consume a point for a socket event.
   * Throws an error (typically from rate-limiter-flexible) if exceeded.
   * Should fail-open (resolve) if Redis connection drops.
   */
  consumeSocketEvent(userId: string, event: string, points: number, durationSeconds: number): Promise<void>;
}
