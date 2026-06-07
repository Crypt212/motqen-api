import { describe, it, expect, vi } from 'vitest';

// Mock Prisma enums before importing the module under test
vi.mock('../../../src/generated/prisma/client.js', () => ({
  OrderStatus: {
    PENDING: 'PENDING',
    TIME_SPECIFIED: 'TIME_SPECIFIED',
    PRICE_AGREED: 'PRICE_AGREED',
    PAID: 'PAID',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  WorkStatus: {
    PENDING: 'PENDING',
    WAITING_FOR_WORK: 'WAITING_FOR_WORK',
    STARTED: 'STARTED',
    DONE: 'DONE',
  },
}));

import {
  canTransitionOrderStatus,
  canTransitionWorkStatus,
} from '../../../src/utils/stateMachine.js';

// Re-import the mocked enums so tests can reference them by value
const OrderStatus = {
  PENDING: 'PENDING' as const,
  TIME_SPECIFIED: 'TIME_SPECIFIED' as const,
  PRICE_AGREED: 'PRICE_AGREED' as const,
  PAID: 'PAID' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELLED: 'CANCELLED' as const,
};

const WorkStatus = {
  PENDING: 'PENDING' as const,
  WAITING_FOR_WORK: 'WAITING_FOR_WORK' as const,
  STARTED: 'STARTED' as const,
  DONE: 'DONE' as const,
};

describe('stateMachine', () => {
  // ─── canTransitionOrderStatus ─────────────────────────────────

  describe('canTransitionOrderStatus', () => {
    // ── Valid transitions ──

    describe('valid transitions from PENDING', () => {
      it('should allow PENDING → TIME_SPECIFIED', () => {
        expect(canTransitionOrderStatus(OrderStatus.PENDING as any, OrderStatus.TIME_SPECIFIED as any)).toBe(true);
      });

      it('should allow PENDING → PRICE_AGREED', () => {
        expect(canTransitionOrderStatus(OrderStatus.PENDING as any, OrderStatus.PRICE_AGREED as any)).toBe(true);
      });

      it('should allow PENDING → CANCELLED', () => {
        expect(canTransitionOrderStatus(OrderStatus.PENDING as any, OrderStatus.CANCELLED as any)).toBe(true);
      });
    });

    describe('valid transitions from TIME_SPECIFIED', () => {
      it('should allow TIME_SPECIFIED → PRICE_AGREED', () => {
        expect(canTransitionOrderStatus(OrderStatus.TIME_SPECIFIED as any, OrderStatus.PRICE_AGREED as any)).toBe(true);
      });

      it('should allow TIME_SPECIFIED → CANCELLED', () => {
        expect(canTransitionOrderStatus(OrderStatus.TIME_SPECIFIED as any, OrderStatus.CANCELLED as any)).toBe(true);
      });
    });

    describe('valid transitions from PRICE_AGREED', () => {
      it('should allow PRICE_AGREED → PAID', () => {
        expect(canTransitionOrderStatus(OrderStatus.PRICE_AGREED as any, OrderStatus.PAID as any)).toBe(true);
      });

      it('should allow PRICE_AGREED → CANCELLED', () => {
        expect(canTransitionOrderStatus(OrderStatus.PRICE_AGREED as any, OrderStatus.CANCELLED as any)).toBe(true);
      });
    });

    describe('valid transitions from PAID', () => {
      it('should allow PAID → COMPLETED', () => {
        expect(canTransitionOrderStatus(OrderStatus.PAID as any, OrderStatus.COMPLETED as any)).toBe(true);
      });
    });

    // ── Terminal states ──

    describe('terminal states', () => {
      it('should not allow any transition from COMPLETED', () => {
        const allStatuses = Object.values(OrderStatus);
        for (const next of allStatuses) {
          expect(canTransitionOrderStatus(OrderStatus.COMPLETED as any, next as any)).toBe(false);
        }
      });

      it('should not allow any transition from CANCELLED', () => {
        const allStatuses = Object.values(OrderStatus);
        for (const next of allStatuses) {
          expect(canTransitionOrderStatus(OrderStatus.CANCELLED as any, next as any)).toBe(false);
        }
      });
    });

    // ── Invalid transitions (skipping states) ──

    describe('invalid transitions — skipping states', () => {
      it('should reject PENDING → PAID (skips TIME_SPECIFIED/PRICE_AGREED)', () => {
        expect(canTransitionOrderStatus(OrderStatus.PENDING as any, OrderStatus.PAID as any)).toBe(false);
      });

      it('should reject PENDING → COMPLETED (skips everything)', () => {
        expect(canTransitionOrderStatus(OrderStatus.PENDING as any, OrderStatus.COMPLETED as any)).toBe(false);
      });

      it('should reject TIME_SPECIFIED → PAID (skips PRICE_AGREED)', () => {
        expect(canTransitionOrderStatus(OrderStatus.TIME_SPECIFIED as any, OrderStatus.PAID as any)).toBe(false);
      });

      it('should reject TIME_SPECIFIED → COMPLETED (skips PRICE_AGREED, PAID)', () => {
        expect(canTransitionOrderStatus(OrderStatus.TIME_SPECIFIED as any, OrderStatus.COMPLETED as any)).toBe(false);
      });

      it('should reject PRICE_AGREED → COMPLETED (skips PAID)', () => {
        expect(canTransitionOrderStatus(OrderStatus.PRICE_AGREED as any, OrderStatus.COMPLETED as any)).toBe(false);
      });
    });

    // ── Invalid transitions (backward) ──

    describe('invalid transitions — backward movement', () => {
      it('should reject PAID → PENDING', () => {
        expect(canTransitionOrderStatus(OrderStatus.PAID as any, OrderStatus.PENDING as any)).toBe(false);
      });

      it('should reject PRICE_AGREED → TIME_SPECIFIED', () => {
        expect(canTransitionOrderStatus(OrderStatus.PRICE_AGREED as any, OrderStatus.TIME_SPECIFIED as any)).toBe(false);
      });

      it('should reject TIME_SPECIFIED → PENDING', () => {
        expect(canTransitionOrderStatus(OrderStatus.TIME_SPECIFIED as any, OrderStatus.PENDING as any)).toBe(false);
      });

      it('should reject COMPLETED → PAID', () => {
        expect(canTransitionOrderStatus(OrderStatus.COMPLETED as any, OrderStatus.PAID as any)).toBe(false);
      });

      it('should reject CANCELLED → PENDING', () => {
        expect(canTransitionOrderStatus(OrderStatus.CANCELLED as any, OrderStatus.PENDING as any)).toBe(false);
      });
    });

    // ── Self-transition ──

    describe('self-transitions', () => {
      it('should reject PENDING → PENDING', () => {
        expect(canTransitionOrderStatus(OrderStatus.PENDING as any, OrderStatus.PENDING as any)).toBe(false);
      });

      it('should reject PAID → PAID', () => {
        expect(canTransitionOrderStatus(OrderStatus.PAID as any, OrderStatus.PAID as any)).toBe(false);
      });

      it('should reject COMPLETED → COMPLETED', () => {
        expect(canTransitionOrderStatus(OrderStatus.COMPLETED as any, OrderStatus.COMPLETED as any)).toBe(false);
      });

      it('should reject CANCELLED → CANCELLED', () => {
        expect(canTransitionOrderStatus(OrderStatus.CANCELLED as any, OrderStatus.CANCELLED as any)).toBe(false);
      });
    });

    // ── PAID cannot be cancelled ──

    describe('PAID cannot be cancelled', () => {
      it('should reject PAID → CANCELLED', () => {
        expect(canTransitionOrderStatus(OrderStatus.PAID as any, OrderStatus.CANCELLED as any)).toBe(false);
      });
    });

    // ── Unknown status ──

    describe('unknown status handling', () => {
      it('should return false for unknown current status', () => {
        expect(canTransitionOrderStatus('UNKNOWN_STATUS' as any, OrderStatus.PENDING as any)).toBe(false);
      });

      it('should return false for unknown next status', () => {
        expect(canTransitionOrderStatus(OrderStatus.PENDING as any, 'UNKNOWN_STATUS' as any)).toBe(false);
      });
    });
  });

  // ─── canTransitionWorkStatus ──────────────────────────────────

  describe('canTransitionWorkStatus', () => {
    // ── Valid transitions ──

    describe('valid transitions', () => {
      it('should allow PENDING → WAITING_FOR_WORK', () => {
        expect(canTransitionWorkStatus(WorkStatus.PENDING as any, WorkStatus.WAITING_FOR_WORK as any)).toBe(true);
      });

      it('should allow WAITING_FOR_WORK → STARTED', () => {
        expect(canTransitionWorkStatus(WorkStatus.WAITING_FOR_WORK as any, WorkStatus.STARTED as any)).toBe(true);
      });

      it('should allow STARTED → DONE', () => {
        expect(canTransitionWorkStatus(WorkStatus.STARTED as any, WorkStatus.DONE as any)).toBe(true);
      });
    });

    // ── Terminal state ──

    describe('terminal state', () => {
      it('should not allow any transition from DONE', () => {
        const allStatuses = Object.values(WorkStatus);
        for (const next of allStatuses) {
          expect(canTransitionWorkStatus(WorkStatus.DONE as any, next as any)).toBe(false);
        }
      });
    });

    // ── Invalid transitions (skipping states) ──

    describe('invalid transitions — skipping states', () => {
      it('should reject PENDING → STARTED (skips WAITING_FOR_WORK)', () => {
        expect(canTransitionWorkStatus(WorkStatus.PENDING as any, WorkStatus.STARTED as any)).toBe(false);
      });

      it('should reject PENDING → DONE (skips everything)', () => {
        expect(canTransitionWorkStatus(WorkStatus.PENDING as any, WorkStatus.DONE as any)).toBe(false);
      });

      it('should reject WAITING_FOR_WORK → DONE (skips STARTED)', () => {
        expect(canTransitionWorkStatus(WorkStatus.WAITING_FOR_WORK as any, WorkStatus.DONE as any)).toBe(false);
      });
    });

    // ── Invalid transitions (backward) ──

    describe('invalid transitions — backward movement', () => {
      it('should reject STARTED → PENDING', () => {
        expect(canTransitionWorkStatus(WorkStatus.STARTED as any, WorkStatus.PENDING as any)).toBe(false);
      });

      it('should reject STARTED → WAITING_FOR_WORK', () => {
        expect(canTransitionWorkStatus(WorkStatus.STARTED as any, WorkStatus.WAITING_FOR_WORK as any)).toBe(false);
      });

      it('should reject WAITING_FOR_WORK → PENDING', () => {
        expect(canTransitionWorkStatus(WorkStatus.WAITING_FOR_WORK as any, WorkStatus.PENDING as any)).toBe(false);
      });

      it('should reject DONE → STARTED', () => {
        expect(canTransitionWorkStatus(WorkStatus.DONE as any, WorkStatus.STARTED as any)).toBe(false);
      });

      it('should reject DONE → PENDING', () => {
        expect(canTransitionWorkStatus(WorkStatus.DONE as any, WorkStatus.PENDING as any)).toBe(false);
      });
    });

    // ── Self-transition ──

    describe('self-transitions', () => {
      it('should reject PENDING → PENDING', () => {
        expect(canTransitionWorkStatus(WorkStatus.PENDING as any, WorkStatus.PENDING as any)).toBe(false);
      });

      it('should reject WAITING_FOR_WORK → WAITING_FOR_WORK', () => {
        expect(canTransitionWorkStatus(WorkStatus.WAITING_FOR_WORK as any, WorkStatus.WAITING_FOR_WORK as any)).toBe(false);
      });

      it('should reject STARTED → STARTED', () => {
        expect(canTransitionWorkStatus(WorkStatus.STARTED as any, WorkStatus.STARTED as any)).toBe(false);
      });

      it('should reject DONE → DONE', () => {
        expect(canTransitionWorkStatus(WorkStatus.DONE as any, WorkStatus.DONE as any)).toBe(false);
      });
    });

    // ── Unknown status ──

    describe('unknown status handling', () => {
      it('should return false for unknown current status', () => {
        expect(canTransitionWorkStatus('UNKNOWN' as any, WorkStatus.PENDING as any)).toBe(false);
      });

      it('should return false for unknown next status', () => {
        expect(canTransitionWorkStatus(WorkStatus.PENDING as any, 'UNKNOWN' as any)).toBe(false);
      });
    });
  });
});
