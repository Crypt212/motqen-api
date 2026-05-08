import { describe, it, expect } from 'vitest';
import {
  canReportTransitionTo,
  isReporterCancellable,
  isAdminTransition,
} from '../../src/utils/reportStateMachine.js';
import { $Enums } from '../../src/generated/prisma/client.js';

const ReportStatus = $Enums.ReportStatus;

describe('Report State Machine Utility', () => {
  describe('canReportTransitionTo', () => {
    it('returns true for valid transitions', () => {
      expect(canReportTransitionTo(ReportStatus.PENDING, ReportStatus.UNDER_REVIEW)).toBe(true);
      expect(canReportTransitionTo(ReportStatus.UNDER_REVIEW, ReportStatus.RESOLVED)).toBe(true);
      expect(canReportTransitionTo(ReportStatus.UNDER_REVIEW, ReportStatus.REJECTED)).toBe(true);
      expect(canReportTransitionTo(ReportStatus.PENDING, ReportStatus.CANCELLED)).toBe(true);
    });

    it('returns false for invalid transitions', () => {
      expect(canReportTransitionTo(ReportStatus.PENDING, ReportStatus.RESOLVED)).toBe(false);
      expect(canReportTransitionTo(ReportStatus.RESOLVED, ReportStatus.PENDING)).toBe(false);
      expect(canReportTransitionTo(ReportStatus.CANCELLED, ReportStatus.PENDING)).toBe(false);
    });
  });

  describe('isReporterCancellable', () => {
    it('returns true for PENDING', () => {
      expect(isReporterCancellable(ReportStatus.PENDING)).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(isReporterCancellable(ReportStatus.UNDER_REVIEW)).toBe(false);
      expect(isReporterCancellable(ReportStatus.RESOLVED)).toBe(false);
      expect(isReporterCancellable(ReportStatus.REJECTED)).toBe(false);
      expect(isReporterCancellable(ReportStatus.CANCELLED)).toBe(false);
    });
  });

  describe('isAdminTransition', () => {
    it('returns true for admin-only transitions', () => {
      expect(isAdminTransition(ReportStatus.UNDER_REVIEW)).toBe(true);
      expect(isAdminTransition(ReportStatus.RESOLVED)).toBe(true);
      expect(isAdminTransition(ReportStatus.REJECTED)).toBe(true);
    });

    it('returns false for reporter transitions', () => {
      expect(isAdminTransition(ReportStatus.PENDING)).toBe(false);
      expect(isAdminTransition(ReportStatus.CANCELLED)).toBe(false);
    });
  });
});
