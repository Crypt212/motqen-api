import { describe, it, expect, vi } from 'vitest';

// The function imports WorkerBalance from a path-aliased module.
// Mock the path-aliased import so the module resolves.
vi.mock('src/domain/financial/workerBalance.entity.js', () => ({}));

import { computeAvailableToWithdraw } from '../../../src/utils/computeAvailableToWithdraw.js';

/**
 * Helper to create a WorkerBalance-shaped object with BigInt fields.
 */
function makeBalance(overrides: {
  totalEarned?: bigint;
  withdrawn?: bigint;
  pendingWithdraw?: bigint;
  onHoldForDispute?: bigint;
  deductedForDebts?: bigint;
} = {}) {
  return {
    id: 'balance-1',
    workerProfileId: 'worker-1',
    totalEarned: overrides.totalEarned ?? 0n,
    withdrawn: overrides.withdrawn ?? 0n,
    pendingWithdraw: overrides.pendingWithdraw ?? 0n,
    onHoldForDispute: overrides.onHoldForDispute ?? 0n,
    deductedForDebts: overrides.deductedForDebts ?? 0n,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
}

describe('computeAvailableToWithdraw', () => {
  // ── Positive balance ──

  describe('positive balance', () => {
    it('should return full earnings when no deductions', () => {
      const balance = makeBalance({ totalEarned: 10000n });
      expect(computeAvailableToWithdraw(balance)).toBe(10000n);
    });

    it('should subtract withdrawn amount', () => {
      const balance = makeBalance({
        totalEarned: 10000n,
        withdrawn: 3000n,
      });
      expect(computeAvailableToWithdraw(balance)).toBe(7000n);
    });

    it('should subtract pendingWithdraw', () => {
      const balance = makeBalance({
        totalEarned: 10000n,
        pendingWithdraw: 2000n,
      });
      expect(computeAvailableToWithdraw(balance)).toBe(8000n);
    });

    it('should subtract onHoldForDispute', () => {
      const balance = makeBalance({
        totalEarned: 10000n,
        onHoldForDispute: 1500n,
      });
      expect(computeAvailableToWithdraw(balance)).toBe(8500n);
    });

    it('should subtract deductedForDebts', () => {
      const balance = makeBalance({
        totalEarned: 10000n,
        deductedForDebts: 500n,
      });
      expect(computeAvailableToWithdraw(balance)).toBe(9500n);
    });

    it('should subtract all deduction fields', () => {
      const balance = makeBalance({
        totalEarned: 10000n,
        withdrawn: 2000n,
        pendingWithdraw: 1000n,
        onHoldForDispute: 500n,
        deductedForDebts: 300n,
      });
      // 10000 - 2000 - 1000 - 500 - 300 = 6200
      expect(computeAvailableToWithdraw(balance)).toBe(6200n);
    });
  });

  // ── Zero balance ──

  describe('zero balance', () => {
    it('should return 0n when all fields are zero', () => {
      const balance = makeBalance();
      expect(computeAvailableToWithdraw(balance)).toBe(0n);
    });

    it('should return 0n when deductions exactly equal earnings', () => {
      const balance = makeBalance({
        totalEarned: 5000n,
        withdrawn: 2000n,
        pendingWithdraw: 1000n,
        onHoldForDispute: 1000n,
        deductedForDebts: 1000n,
      });
      expect(computeAvailableToWithdraw(balance)).toBe(0n);
    });
  });

  // ── Negative result (debts exceed earnings) ──

  describe('negative result', () => {
    it('should return negative when deductions exceed earnings', () => {
      const balance = makeBalance({
        totalEarned: 1000n,
        withdrawn: 500n,
        pendingWithdraw: 300n,
        onHoldForDispute: 200n,
        deductedForDebts: 500n,
      });
      // 1000 - 500 - 300 - 200 - 500 = -500
      expect(computeAvailableToWithdraw(balance)).toBe(-500n);
    });

    it('should return negative when only debts are present and exceed earnings', () => {
      const balance = makeBalance({
        totalEarned: 0n,
        deductedForDebts: 100n,
      });
      expect(computeAvailableToWithdraw(balance)).toBe(-100n);
    });
  });

  // ── Large values ──

  describe('large values', () => {
    it('should handle large BigInt values correctly', () => {
      const balance = makeBalance({
        totalEarned: 999999999999n,
        withdrawn: 100000000000n,
        pendingWithdraw: 50000000000n,
        onHoldForDispute: 25000000000n,
        deductedForDebts: 10000000000n,
      });
      // 999999999999 - 100000000000 - 50000000000 - 25000000000 - 10000000000 = 814999999999
      expect(computeAvailableToWithdraw(balance)).toBe(814999999999n);
    });
  });

  // ── Single deduction active ──

  describe('single deduction field active', () => {
    it('should compute correctly with only withdrawn set', () => {
      const balance = makeBalance({ totalEarned: 5000n, withdrawn: 5000n });
      expect(computeAvailableToWithdraw(balance)).toBe(0n);
    });

    it('should compute correctly with only pendingWithdraw set', () => {
      const balance = makeBalance({ totalEarned: 5000n, pendingWithdraw: 3000n });
      expect(computeAvailableToWithdraw(balance)).toBe(2000n);
    });
  });
});
