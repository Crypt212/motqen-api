import { describe, it, expect } from 'vitest';

import { hasOverlap } from '../../../src/utils/overlapCheck.js';

/**
 * Helper: create a Date from an ISO string or offset hours from a base.
 * Using 2025-01-01T00:00:00Z as base for readability.
 */
function d(hoursOffset: number): Date {
  return new Date(Date.UTC(2025, 0, 1, hoursOffset));
}

describe('overlapCheck — hasOverlap', () => {
  // ── Complete overlap (identical ranges) ──

  describe('complete overlap', () => {
    it('should detect overlap when ranges are identical', () => {
      expect(hasOverlap(d(10), d(12), d(10), d(12))).toBe(true);
    });
  });

  // ── Partial overlap (start) ──

  describe('partial overlap — new starts before existing', () => {
    it('should detect overlap when new range starts before and ends within existing', () => {
      // new: [8, 11), existing: [10, 14)
      expect(hasOverlap(d(8), d(11), d(10), d(14))).toBe(true);
    });
  });

  // ── Partial overlap (end) ──

  describe('partial overlap — new ends after existing', () => {
    it('should detect overlap when new range starts within and ends after existing', () => {
      // new: [12, 16), existing: [10, 14)
      expect(hasOverlap(d(12), d(16), d(10), d(14))).toBe(true);
    });
  });

  // ── One contains the other ──

  describe('containment', () => {
    it('should detect overlap when new range is entirely inside existing', () => {
      // new: [11, 13), existing: [10, 14)
      expect(hasOverlap(d(11), d(13), d(10), d(14))).toBe(true);
    });

    it('should detect overlap when existing range is entirely inside new', () => {
      // new: [8, 16), existing: [10, 14)
      expect(hasOverlap(d(8), d(16), d(10), d(14))).toBe(true);
    });
  });

  // ── No overlap (before) ──

  describe('no overlap — new entirely before existing', () => {
    it('should return false when new range ends before existing starts', () => {
      // new: [6, 8), existing: [10, 14)
      expect(hasOverlap(d(6), d(8), d(10), d(14))).toBe(false);
    });
  });

  // ── No overlap (after) ──

  describe('no overlap — new entirely after existing', () => {
    it('should return false when new range starts after existing ends', () => {
      // new: [16, 20), existing: [10, 14)
      expect(hasOverlap(d(16), d(20), d(10), d(14))).toBe(false);
    });
  });

  // ── Touching boundaries (edge cases) ──

  describe('touching boundaries', () => {
    it('should return false when new ends exactly when existing starts (non-overlapping)', () => {
      // new: [6, 10), existing: [10, 14)
      // newEnd (10) > existingStart (10) is false → no overlap
      expect(hasOverlap(d(6), d(10), d(10), d(14))).toBe(false);
    });

    it('should return false when new starts exactly when existing ends (non-overlapping)', () => {
      // new: [14, 18), existing: [10, 14)
      // newStart (14) < existingEnd (14) is false → no overlap
      expect(hasOverlap(d(14), d(18), d(10), d(14))).toBe(false);
    });

    it('should detect overlap when new end is 1ms after existing start', () => {
      const existingStart = new Date('2025-01-01T10:00:00.000Z');
      const existingEnd = new Date('2025-01-01T14:00:00.000Z');
      const newStart = new Date('2025-01-01T06:00:00.000Z');
      const newEnd = new Date('2025-01-01T10:00:00.001Z');
      expect(hasOverlap(newStart, newEnd, existingStart, existingEnd)).toBe(true);
    });
  });

  // ── Same start and end (zero-duration) ──

  describe('zero-duration ranges', () => {
    it('should return false for zero-duration new range at existing start', () => {
      // new: [10, 10), existing: [10, 14)
      // newStart (10) < existingEnd (14) → true, BUT newEnd (10) > existingStart (10) → false
      expect(hasOverlap(d(10), d(10), d(10), d(14))).toBe(false);
    });

    it('should return false for zero-duration new range at existing end', () => {
      // new: [14, 14), existing: [10, 14)
      expect(hasOverlap(d(14), d(14), d(10), d(14))).toBe(false);
    });

    it('should return true for zero-duration new range inside existing', () => {
      // new: [12, 12), existing: [10, 14)
      // newStart (12) < existingEnd (14) → true, newEnd (12) > existingStart (10) → true
      expect(hasOverlap(d(12), d(12), d(10), d(14))).toBe(true);
    });

    it('should return false for two zero-duration ranges at same point', () => {
      // new: [10, 10), existing: [10, 10)
      expect(hasOverlap(d(10), d(10), d(10), d(10))).toBe(false);
    });
  });

  // ── Cross-day ranges ──

  describe('cross-day ranges', () => {
    it('should detect overlap across midnight', () => {
      const newStart = new Date('2025-01-01T22:00:00Z');
      const newEnd = new Date('2025-01-02T04:00:00Z');
      const existingStart = new Date('2025-01-02T02:00:00Z');
      const existingEnd = new Date('2025-01-02T06:00:00Z');
      expect(hasOverlap(newStart, newEnd, existingStart, existingEnd)).toBe(true);
    });
  });

  // ── Symmetry ──

  describe('symmetry', () => {
    it('should be symmetric — overlap is detected regardless of argument order', () => {
      const a = hasOverlap(d(8), d(12), d(10), d(14));
      const b = hasOverlap(d(10), d(14), d(8), d(12));
      expect(a).toBe(true);
      expect(b).toBe(true);
    });

    it('should be symmetric — no overlap is consistent regardless of argument order', () => {
      const a = hasOverlap(d(6), d(8), d(10), d(14));
      const b = hasOverlap(d(10), d(14), d(6), d(8));
      expect(a).toBe(false);
      expect(b).toBe(false);
    });
  });
});
