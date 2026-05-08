import { describe, it, expect } from 'vitest';
import {
  CATEGORY_TYPE_MAP,
  isValidCategoryTypePair,
  getAllowedTypes,
} from '../../src/utils/reportValidation.js';
import { CreateReportSchema } from '../../src/schemas/requests/report.request.js';
import { $Enums } from '../../src/generated/prisma/client.js';

const ProblemCategory = $Enums.ProblemCategory;
const ProblemType = $Enums.ProblemType;
const ReportTargetType = $Enums.ReportTargetType;

describe('Report Validation Utility', () => {
  it('contains every ProblemCategory key in the map', () => {
    const keys = Object.keys(CATEGORY_TYPE_MAP) as ProblemCategory[];
    const allCategories = Object.values(ProblemCategory);
    expect(keys.sort()).toEqual(allCategories.sort());
  });

  describe('isValidCategoryTypePair', () => {
    it('returns true for valid pairs', () => {
      expect(isValidCategoryTypePair(ProblemCategory.ORDER_ISSUE, ProblemType.UNFINISHED_WORK)).toBe(true);
      expect(isValidCategoryTypePair(ProblemCategory.CHAT_MESSAGE, ProblemType.HARASSMENT)).toBe(true);
      expect(isValidCategoryTypePair(ProblemCategory.OTHER, ProblemType.OTHER)).toBe(true);
    });

    it('returns false for invalid pairs', () => {
      expect(isValidCategoryTypePair(ProblemCategory.ORDER_ISSUE, ProblemType.SPAM)).toBe(false);
      expect(isValidCategoryTypePair(ProblemCategory.CLIENT_CONDUCT, ProblemType.UNFINISHED_WORK)).toBe(false);
      expect(isValidCategoryTypePair(ProblemCategory.OTHER, ProblemType.SPAM)).toBe(false);
    });
  });

  describe('getAllowedTypes', () => {
    it('returns exactly the allowed types for a category', () => {
      expect(getAllowedTypes(ProblemCategory.WORKER_CONDUCT)).toEqual([
        ProblemType.HARASSMENT,
        ProblemType.UNPROFESSIONAL_BEHAVIOR,
        ProblemType.FRAUD,
        ProblemType.OTHER,
      ]);
    });
  });

  describe('CreateReportSchema', () => {
    const validData = {
      targetType: ReportTargetType.ORDER,
      targetId: 'f0000000-0000-0000-0000-000000000000',
      problemCategory: ProblemCategory.ORDER_ISSUE,
      problemType: ProblemType.UNFINISHED_WORK,
      description: 'This is a description that meets the minimum length.',
    };

    it('passes valid category-type pairs', () => {
      const result = CreateReportSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid category-type pairs', () => {
      const invalidData = {
        ...validData,
        problemCategory: ProblemCategory.ORDER_ISSUE,
        problemType: ProblemType.SPAM,
      };
      const result = CreateReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('problemType');
      }
    });
  });
});
