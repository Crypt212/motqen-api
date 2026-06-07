import { describe, it, expect, vi } from 'vitest';

// Mock Prisma $Enums before importing the module under test
vi.mock('../../../src/generated/prisma/client.js', () => ({
  $Enums: {
    ProblemCategory: {
      ORDER_ISSUE: 'ORDER_ISSUE',
      WORKER_CONDUCT: 'WORKER_CONDUCT',
      CLIENT_CONDUCT: 'CLIENT_CONDUCT',
      CHAT_MESSAGE: 'CHAT_MESSAGE',
      OTHER: 'OTHER',
    },
    ProblemType: {
      UNFINISHED_WORK: 'UNFINISHED_WORK',
      PAYMENT_DISPUTE: 'PAYMENT_DISPUTE',
      NO_SHOW: 'NO_SHOW',
      PROPERTY_DAMAGE: 'PROPERTY_DAMAGE',
      HARASSMENT: 'HARASSMENT',
      UNPROFESSIONAL_BEHAVIOR: 'UNPROFESSIONAL_BEHAVIOR',
      FRAUD: 'FRAUD',
      PAYMENT_FRAUD: 'PAYMENT_FRAUD',
      UNREASONABLE_DEMANDS: 'UNREASONABLE_DEMANDS',
      SPAM: 'SPAM',
      INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
      OTHER: 'OTHER',
    },
  },
}));

import {
  isValidCategoryTypePair,
  getAllowedTypes,
} from '../../../src/utils/reportValidation.js';

const ProblemCategory = {
  ORDER_ISSUE: 'ORDER_ISSUE' as const,
  WORKER_CONDUCT: 'WORKER_CONDUCT' as const,
  CLIENT_CONDUCT: 'CLIENT_CONDUCT' as const,
  CHAT_MESSAGE: 'CHAT_MESSAGE' as const,
  OTHER: 'OTHER' as const,
};

const ProblemType = {
  UNFINISHED_WORK: 'UNFINISHED_WORK' as const,
  PAYMENT_DISPUTE: 'PAYMENT_DISPUTE' as const,
  NO_SHOW: 'NO_SHOW' as const,
  PROPERTY_DAMAGE: 'PROPERTY_DAMAGE' as const,
  HARASSMENT: 'HARASSMENT' as const,
  UNPROFESSIONAL_BEHAVIOR: 'UNPROFESSIONAL_BEHAVIOR' as const,
  FRAUD: 'FRAUD' as const,
  PAYMENT_FRAUD: 'PAYMENT_FRAUD' as const,
  UNREASONABLE_DEMANDS: 'UNREASONABLE_DEMANDS' as const,
  SPAM: 'SPAM' as const,
  INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT' as const,
  OTHER: 'OTHER' as const,
};

describe('reportValidation', () => {
  // ─── isValidCategoryTypePair ──────────────────────────────────

  describe('isValidCategoryTypePair', () => {
    // ── ORDER_ISSUE valid pairs ──

    describe('ORDER_ISSUE', () => {
      it.each([
        ProblemType.UNFINISHED_WORK,
        ProblemType.PAYMENT_DISPUTE,
        ProblemType.NO_SHOW,
        ProblemType.PROPERTY_DAMAGE,
        ProblemType.OTHER,
      ])('should accept ORDER_ISSUE + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.ORDER_ISSUE as any, type as any)).toBe(true);
      });

      it.each([
        ProblemType.HARASSMENT,
        ProblemType.UNPROFESSIONAL_BEHAVIOR,
        ProblemType.FRAUD,
        ProblemType.PAYMENT_FRAUD,
        ProblemType.UNREASONABLE_DEMANDS,
        ProblemType.SPAM,
        ProblemType.INAPPROPRIATE_CONTENT,
      ])('should reject ORDER_ISSUE + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.ORDER_ISSUE as any, type as any)).toBe(false);
      });
    });

    // ── WORKER_CONDUCT valid pairs ──

    describe('WORKER_CONDUCT', () => {
      it.each([
        ProblemType.HARASSMENT,
        ProblemType.UNPROFESSIONAL_BEHAVIOR,
        ProblemType.FRAUD,
        ProblemType.OTHER,
      ])('should accept WORKER_CONDUCT + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.WORKER_CONDUCT as any, type as any)).toBe(true);
      });

      it.each([
        ProblemType.UNFINISHED_WORK,
        ProblemType.PAYMENT_DISPUTE,
        ProblemType.NO_SHOW,
        ProblemType.PROPERTY_DAMAGE,
        ProblemType.PAYMENT_FRAUD,
        ProblemType.UNREASONABLE_DEMANDS,
        ProblemType.SPAM,
        ProblemType.INAPPROPRIATE_CONTENT,
      ])('should reject WORKER_CONDUCT + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.WORKER_CONDUCT as any, type as any)).toBe(false);
      });
    });

    // ── CLIENT_CONDUCT valid pairs ──

    describe('CLIENT_CONDUCT', () => {
      it.each([
        ProblemType.HARASSMENT,
        ProblemType.PAYMENT_FRAUD,
        ProblemType.UNREASONABLE_DEMANDS,
        ProblemType.OTHER,
      ])('should accept CLIENT_CONDUCT + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.CLIENT_CONDUCT as any, type as any)).toBe(true);
      });

      it.each([
        ProblemType.UNFINISHED_WORK,
        ProblemType.PAYMENT_DISPUTE,
        ProblemType.NO_SHOW,
        ProblemType.PROPERTY_DAMAGE,
        ProblemType.UNPROFESSIONAL_BEHAVIOR,
        ProblemType.FRAUD,
        ProblemType.SPAM,
        ProblemType.INAPPROPRIATE_CONTENT,
      ])('should reject CLIENT_CONDUCT + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.CLIENT_CONDUCT as any, type as any)).toBe(false);
      });
    });

    // ── CHAT_MESSAGE valid pairs ──

    describe('CHAT_MESSAGE', () => {
      it.each([
        ProblemType.SPAM,
        ProblemType.INAPPROPRIATE_CONTENT,
        ProblemType.HARASSMENT,
        ProblemType.OTHER,
      ])('should accept CHAT_MESSAGE + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.CHAT_MESSAGE as any, type as any)).toBe(true);
      });

      it.each([
        ProblemType.UNFINISHED_WORK,
        ProblemType.PAYMENT_DISPUTE,
        ProblemType.NO_SHOW,
        ProblemType.PROPERTY_DAMAGE,
        ProblemType.UNPROFESSIONAL_BEHAVIOR,
        ProblemType.FRAUD,
        ProblemType.PAYMENT_FRAUD,
        ProblemType.UNREASONABLE_DEMANDS,
      ])('should reject CHAT_MESSAGE + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.CHAT_MESSAGE as any, type as any)).toBe(false);
      });
    });

    // ── OTHER valid pairs ──

    describe('OTHER', () => {
      it('should accept OTHER + OTHER', () => {
        expect(isValidCategoryTypePair(ProblemCategory.OTHER as any, ProblemType.OTHER as any)).toBe(true);
      });

      it.each([
        ProblemType.UNFINISHED_WORK,
        ProblemType.PAYMENT_DISPUTE,
        ProblemType.NO_SHOW,
        ProblemType.PROPERTY_DAMAGE,
        ProblemType.HARASSMENT,
        ProblemType.UNPROFESSIONAL_BEHAVIOR,
        ProblemType.FRAUD,
        ProblemType.PAYMENT_FRAUD,
        ProblemType.UNREASONABLE_DEMANDS,
        ProblemType.SPAM,
        ProblemType.INAPPROPRIATE_CONTENT,
      ])('should reject OTHER + %s', (type) => {
        expect(isValidCategoryTypePair(ProblemCategory.OTHER as any, type as any)).toBe(false);
      });
    });

    // ── Cross-category uniqueness ──

    describe('cross-category validation', () => {
      it('HARASSMENT is valid for WORKER_CONDUCT, CLIENT_CONDUCT, and CHAT_MESSAGE but not ORDER_ISSUE or OTHER', () => {
        expect(isValidCategoryTypePair(ProblemCategory.WORKER_CONDUCT as any, ProblemType.HARASSMENT as any)).toBe(true);
        expect(isValidCategoryTypePair(ProblemCategory.CLIENT_CONDUCT as any, ProblemType.HARASSMENT as any)).toBe(true);
        expect(isValidCategoryTypePair(ProblemCategory.CHAT_MESSAGE as any, ProblemType.HARASSMENT as any)).toBe(true);
        expect(isValidCategoryTypePair(ProblemCategory.ORDER_ISSUE as any, ProblemType.HARASSMENT as any)).toBe(false);
        expect(isValidCategoryTypePair(ProblemCategory.OTHER as any, ProblemType.HARASSMENT as any)).toBe(false);
      });

      it('FRAUD is only valid for WORKER_CONDUCT', () => {
        expect(isValidCategoryTypePair(ProblemCategory.WORKER_CONDUCT as any, ProblemType.FRAUD as any)).toBe(true);
        expect(isValidCategoryTypePair(ProblemCategory.ORDER_ISSUE as any, ProblemType.FRAUD as any)).toBe(false);
        expect(isValidCategoryTypePair(ProblemCategory.CLIENT_CONDUCT as any, ProblemType.FRAUD as any)).toBe(false);
        expect(isValidCategoryTypePair(ProblemCategory.CHAT_MESSAGE as any, ProblemType.FRAUD as any)).toBe(false);
      });

      it('PAYMENT_FRAUD is only valid for CLIENT_CONDUCT', () => {
        expect(isValidCategoryTypePair(ProblemCategory.CLIENT_CONDUCT as any, ProblemType.PAYMENT_FRAUD as any)).toBe(true);
        expect(isValidCategoryTypePair(ProblemCategory.ORDER_ISSUE as any, ProblemType.PAYMENT_FRAUD as any)).toBe(false);
        expect(isValidCategoryTypePair(ProblemCategory.WORKER_CONDUCT as any, ProblemType.PAYMENT_FRAUD as any)).toBe(false);
      });
    });
  });

  // ─── getAllowedTypes ──────────────────────────────────────────

  describe('getAllowedTypes', () => {
    it('should return correct types for ORDER_ISSUE', () => {
      const types = getAllowedTypes(ProblemCategory.ORDER_ISSUE as any);
      expect(types).toEqual([
        ProblemType.UNFINISHED_WORK,
        ProblemType.PAYMENT_DISPUTE,
        ProblemType.NO_SHOW,
        ProblemType.PROPERTY_DAMAGE,
        ProblemType.OTHER,
      ]);
    });

    it('should return correct types for WORKER_CONDUCT', () => {
      const types = getAllowedTypes(ProblemCategory.WORKER_CONDUCT as any);
      expect(types).toEqual([
        ProblemType.HARASSMENT,
        ProblemType.UNPROFESSIONAL_BEHAVIOR,
        ProblemType.FRAUD,
        ProblemType.OTHER,
      ]);
    });

    it('should return correct types for CLIENT_CONDUCT', () => {
      const types = getAllowedTypes(ProblemCategory.CLIENT_CONDUCT as any);
      expect(types).toEqual([
        ProblemType.HARASSMENT,
        ProblemType.PAYMENT_FRAUD,
        ProblemType.UNREASONABLE_DEMANDS,
        ProblemType.OTHER,
      ]);
    });

    it('should return correct types for CHAT_MESSAGE', () => {
      const types = getAllowedTypes(ProblemCategory.CHAT_MESSAGE as any);
      expect(types).toEqual([
        ProblemType.SPAM,
        ProblemType.INAPPROPRIATE_CONTENT,
        ProblemType.HARASSMENT,
        ProblemType.OTHER,
      ]);
    });

    it('should return only OTHER for OTHER category', () => {
      const types = getAllowedTypes(ProblemCategory.OTHER as any);
      expect(types).toEqual([ProblemType.OTHER]);
    });

    it('should return an array (not undefined) for every known category', () => {
      for (const category of Object.values(ProblemCategory)) {
        const types = getAllowedTypes(category as any);
        expect(Array.isArray(types)).toBe(true);
        expect(types.length).toBeGreaterThan(0);
      }
    });

    it('every category should include OTHER as an allowed type', () => {
      for (const category of Object.values(ProblemCategory)) {
        const types = getAllowedTypes(category as any);
        expect(types).toContain(ProblemType.OTHER);
      }
    });
  });
});
