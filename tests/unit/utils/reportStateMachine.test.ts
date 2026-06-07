import { describe, it, expect, vi } from 'vitest';

// Mock Prisma $Enums before importing the module under test
vi.mock('../../../src/generated/prisma/client.js', () => ({
  $Enums: {
    ReportStatus: {
      PENDING: 'PENDING',
      UNDER_REVIEW: 'UNDER_REVIEW',
      RESOLVED: 'RESOLVED',
      REJECTED: 'REJECTED',
      CANCELLED: 'CANCELLED',
    },
  },
}));

import {
  canReportTransitionTo,
  isAdminTransition,
  isReporterCancellable,
} from '../../../src/utils/reportStateMachine.js';

const ReportStatus = {
  PENDING: 'PENDING' as const,
  UNDER_REVIEW: 'UNDER_REVIEW' as const,
  RESOLVED: 'RESOLVED' as const,
  REJECTED: 'REJECTED' as const,
  CANCELLED: 'CANCELLED' as const,
};

describe('reportStateMachine', () => {
  // ─── canReportTransitionTo ────────────────────────────────────

  describe('canReportTransitionTo', () => {
    // ── Valid transitions from PENDING ──

    describe('valid transitions from PENDING', () => {
      it('should allow PENDING → UNDER_REVIEW', () => {
        expect(canReportTransitionTo(ReportStatus.PENDING as any, ReportStatus.UNDER_REVIEW as any)).toBe(true);
      });

      it('should allow PENDING → CANCELLED', () => {
        expect(canReportTransitionTo(ReportStatus.PENDING as any, ReportStatus.CANCELLED as any)).toBe(true);
      });
    });

    // ── Valid transitions from UNDER_REVIEW ──

    describe('valid transitions from UNDER_REVIEW', () => {
      it('should allow UNDER_REVIEW → RESOLVED', () => {
        expect(canReportTransitionTo(ReportStatus.UNDER_REVIEW as any, ReportStatus.RESOLVED as any)).toBe(true);
      });

      it('should allow UNDER_REVIEW → REJECTED', () => {
        expect(canReportTransitionTo(ReportStatus.UNDER_REVIEW as any, ReportStatus.REJECTED as any)).toBe(true);
      });
    });

    // ── Invalid transitions from PENDING ──

    describe('invalid transitions from PENDING', () => {
      it('should reject PENDING → RESOLVED', () => {
        expect(canReportTransitionTo(ReportStatus.PENDING as any, ReportStatus.RESOLVED as any)).toBe(false);
      });

      it('should reject PENDING → REJECTED', () => {
        expect(canReportTransitionTo(ReportStatus.PENDING as any, ReportStatus.REJECTED as any)).toBe(false);
      });

      it('should reject PENDING → PENDING (self)', () => {
        expect(canReportTransitionTo(ReportStatus.PENDING as any, ReportStatus.PENDING as any)).toBe(false);
      });
    });

    // ── Invalid transitions from UNDER_REVIEW ──

    describe('invalid transitions from UNDER_REVIEW', () => {
      it('should reject UNDER_REVIEW → PENDING', () => {
        expect(canReportTransitionTo(ReportStatus.UNDER_REVIEW as any, ReportStatus.PENDING as any)).toBe(false);
      });

      it('should reject UNDER_REVIEW → CANCELLED', () => {
        expect(canReportTransitionTo(ReportStatus.UNDER_REVIEW as any, ReportStatus.CANCELLED as any)).toBe(false);
      });

      it('should reject UNDER_REVIEW → UNDER_REVIEW (self)', () => {
        expect(canReportTransitionTo(ReportStatus.UNDER_REVIEW as any, ReportStatus.UNDER_REVIEW as any)).toBe(false);
      });
    });

    // ── Terminal states ──

    describe('terminal states', () => {
      it('should not allow any transition from RESOLVED', () => {
        const allStatuses = Object.values(ReportStatus);
        for (const next of allStatuses) {
          expect(canReportTransitionTo(ReportStatus.RESOLVED as any, next as any)).toBe(false);
        }
      });

      it('should not allow any transition from REJECTED', () => {
        const allStatuses = Object.values(ReportStatus);
        for (const next of allStatuses) {
          expect(canReportTransitionTo(ReportStatus.REJECTED as any, next as any)).toBe(false);
        }
      });

      it('should not allow any transition from CANCELLED', () => {
        const allStatuses = Object.values(ReportStatus);
        for (const next of allStatuses) {
          expect(canReportTransitionTo(ReportStatus.CANCELLED as any, next as any)).toBe(false);
        }
      });
    });
  });

  // ─── isAdminTransition ────────────────────────────────────────

  describe('isAdminTransition', () => {
    it('should return true for UNDER_REVIEW', () => {
      expect(isAdminTransition(ReportStatus.UNDER_REVIEW as any)).toBe(true);
    });

    it('should return true for RESOLVED', () => {
      expect(isAdminTransition(ReportStatus.RESOLVED as any)).toBe(true);
    });

    it('should return true for REJECTED', () => {
      expect(isAdminTransition(ReportStatus.REJECTED as any)).toBe(true);
    });

    it('should return false for PENDING', () => {
      expect(isAdminTransition(ReportStatus.PENDING as any)).toBe(false);
    });

    it('should return false for CANCELLED', () => {
      expect(isAdminTransition(ReportStatus.CANCELLED as any)).toBe(false);
    });

    it('should return false for unknown status', () => {
      expect(isAdminTransition('UNKNOWN' as any)).toBe(false);
    });
  });

  // ─── isReporterCancellable ────────────────────────────────────

  describe('isReporterCancellable', () => {
    it('should return true for PENDING', () => {
      expect(isReporterCancellable(ReportStatus.PENDING as any)).toBe(true);
    });

    it('should return false for UNDER_REVIEW', () => {
      expect(isReporterCancellable(ReportStatus.UNDER_REVIEW as any)).toBe(false);
    });

    it('should return false for RESOLVED', () => {
      expect(isReporterCancellable(ReportStatus.RESOLVED as any)).toBe(false);
    });

    it('should return false for REJECTED', () => {
      expect(isReporterCancellable(ReportStatus.REJECTED as any)).toBe(false);
    });

    it('should return false for CANCELLED', () => {
      expect(isReporterCancellable(ReportStatus.CANCELLED as any)).toBe(false);
    });

    it('should return false for unknown status', () => {
      expect(isReporterCancellable('UNKNOWN' as any)).toBe(false);
    });
  });
});
