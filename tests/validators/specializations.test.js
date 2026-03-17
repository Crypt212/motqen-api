/**
 * @fileoverview Tests for specialization validators
 * @module tests/validators/specializations
 */

import {
  SPECIALIZATION_QUERY_CONFIG,
  SUB_SPECIALIZATION_QUERY_CONFIG,
  validateSpecializationIdParam,
  validateSubSpecializationIdParam,
  validateSpecializationName,
  validateSpecializationNameAr,
  validateSpecializationCategory,
  validateCreateSpecialization,
  validateUpdateSpecialization,
  validateSubSpecializationName,
  validateSubSpecializationNameAr,
  validateCreateSubSpecialization,
  validateGetSpecializations,
  validateGetSubSpecializations,
} from '../../src/validators/specializations.js';

const CATEGORIES = [
  'ELECTRICITY',
  'PLUMBING',
  'AC',
  'CARPENTRY',
  'GENERALMAINTENANCE',
  'PAINTING',
  'CONSTRUCTION',
  'CLEANING',
  'INSTALLATION',
  'FURNITURETRANSPORT',
  'DRILLING',
  'ELECTRICALAPPLIANCES',
  'DEFAULTCATEGORY',
];

describe('SPECIALIZATION_QUERY_CONFIG', () => {
  test('should have correct allowedFilterFields', () => {
    expect(SPECIALIZATION_QUERY_CONFIG.allowedFilterFields).toContain('name');
    expect(SPECIALIZATION_QUERY_CONFIG.allowedFilterFields).toContain('nameAr');
    expect(SPECIALIZATION_QUERY_CONFIG.allowedFilterFields).toContain(
      'category'
    );
  });

  test('should have correct filterFieldTypes for category', () => {
    expect(SPECIALIZATION_QUERY_CONFIG.filterFieldTypes.category.type).toBe(
      'enum'
    );
    expect(
      SPECIALIZATION_QUERY_CONFIG.filterFieldTypes.category.enumValues
    ).toEqual(CATEGORIES);
  });
});

describe('SUB_SPECIALIZATION_QUERY_CONFIG', () => {
  test('should have correct allowedFilterFields', () => {
    expect(SUB_SPECIALIZATION_QUERY_CONFIG.allowedFilterFields).toContain(
      'name'
    );
    expect(SUB_SPECIALIZATION_QUERY_CONFIG.allowedFilterFields).toContain(
      'nameAr'
    );
    expect(SUB_SPECIALIZATION_QUERY_CONFIG.allowedFilterFields).toContain(
      'mainSpecializationId'
    );
  });
});

describe('validateSpecializationIdParam', () => {
  test('should return array of validators', () => {
    const result = validateSpecializationIdParam();
    expect(Array.isArray(result)).toBe(true);
  });

  test('should accept custom param name', () => {
    const result = validateSpecializationIdParam('specializationId');
    expect(result.length).toBe(1);
  });
});

describe('validateSubSpecializationIdParam', () => {
  test('should return array of validators', () => {
    const result = validateSubSpecializationIdParam();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('validateSpecializationName', () => {
  test('should create required validator', () => {
    const validator = validateSpecializationName('', true);
    expect(validator).toBeDefined();
  });

  test('should create optional validator', () => {
    const validator = validateSpecializationName('', false);
    expect(validator).toBeDefined();
  });
});

describe('validateSpecializationNameAr', () => {
  test('should create validator', () => {
    const validator = validateSpecializationNameAr('', false);
    expect(validator).toBeDefined();
  });
});

describe('validateSpecializationCategory', () => {
  test('should create required validator', () => {
    const validator = validateSpecializationCategory('', true);
    expect(validator).toBeDefined();
  });

  test('should create optional validator', () => {
    const validator = validateSpecializationCategory('', false);
    expect(validator).toBeDefined();
  });
});

describe('validateCreateSpecialization', () => {
  test('should be defined', () => {
    expect(validateCreateSpecialization).toBeDefined();
  });

  test('should have validators for name, nameAr, category', () => {
    expect(validateCreateSpecialization.length).toBe(3);
  });
});

describe('validateUpdateSpecialization', () => {
  test('should be defined', () => {
    expect(validateUpdateSpecialization).toBeDefined();
  });
});

describe('validateSubSpecializationName', () => {
  test('should create required validator', () => {
    const validator = validateSubSpecializationName('', true);
    expect(validator).toBeDefined();
  });
});

describe('validateSubSpecializationNameAr', () => {
  test('should create validator', () => {
    const validator = validateSubSpecializationNameAr('', false);
    expect(validator).toBeDefined();
  });
});

describe('validateCreateSubSpecialization', () => {
  test('should be defined', () => {
    expect(validateCreateSubSpecialization).toBeDefined();
  });

  test('should have validators for name, nameAr', () => {
    expect(validateCreateSubSpecialization.length).toBe(2);
  });
});

describe('validateGetSpecializations', () => {
  test('should be defined', () => {
    expect(validateGetSpecializations).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateGetSpecializations)).toBe(true);
  });
});

describe('validateGetSubSpecializations', () => {
  test('should be defined', () => {
    expect(validateGetSubSpecializations).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateGetSubSpecializations)).toBe(true);
  });
});
