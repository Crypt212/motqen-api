/**
 * @fileoverview Tests for government validators
 * @module tests/validators/governments
 */

import {
  GOVERNMENT_QUERY_CONFIG,
  CITY_QUERY_CONFIG,
  validateGetGovernments,
  validateGetGovernmentById,
  validateCreateGovernment,
  validateUpdateGovernment,
  validateDeleteGovernment,
  validateGetCities,
  validateGetCityById,
  validateCreateCity,
  validateUpdateCity,
  validateDeleteCity,
} from '../../src/validators/governments.js';

describe('GOVERNMENT_QUERY_CONFIG', () => {
  test('should have correct allowedFilterFields', () => {
    expect(GOVERNMENT_QUERY_CONFIG.allowedFilterFields).toContain('id');
    expect(GOVERNMENT_QUERY_CONFIG.allowedFilterFields).toContain('name');
    expect(GOVERNMENT_QUERY_CONFIG.allowedFilterFields).toContain('nameAr');
  });

  test('should have correct allowedOrderByFields', () => {
    expect(GOVERNMENT_QUERY_CONFIG.allowedOrderByFields).toContain('name');
    expect(GOVERNMENT_QUERY_CONFIG.allowedOrderByFields).toContain('createdAt');
  });

  test('should have correct filterFieldTypes', () => {
    expect(GOVERNMENT_QUERY_CONFIG.filterFieldTypes.id.type).toBe('uuid');
    expect(GOVERNMENT_QUERY_CONFIG.filterFieldTypes.name.type).toBe('string');
    expect(GOVERNMENT_QUERY_CONFIG.filterFieldTypes.nameAr.type).toBe('string');
  });
});

describe('CITY_QUERY_CONFIG', () => {
  test('should have correct allowedFilterFields', () => {
    expect(CITY_QUERY_CONFIG.allowedFilterFields).toContain('id');
    expect(CITY_QUERY_CONFIG.allowedFilterFields).toContain('name');
    expect(CITY_QUERY_CONFIG.allowedFilterFields).toContain('nameAr');
    expect(CITY_QUERY_CONFIG.allowedFilterFields).toContain('governmentId');
  });

  test('should have correct filterFieldTypes', () => {
    expect(CITY_QUERY_CONFIG.filterFieldTypes.governmentId.type).toBe('uuid');
  });
});

describe('validateGetGovernments', () => {
  test('should be defined', () => {
    expect(validateGetGovernments).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateGetGovernments)).toBe(true);
  });
});

describe('validateGetGovernmentById', () => {
  test('should be defined', () => {
    expect(validateGetGovernmentById).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateGetGovernmentById)).toBe(true);
  });
});

describe('validateCreateGovernment', () => {
  test('should be defined', () => {
    expect(validateCreateGovernment).toBeDefined();
  });

  test('should have validators for name, nameAr, long, lat', () => {
    expect(validateCreateGovernment.length).toBeGreaterThanOrEqual(4);
  });
});

describe('validateUpdateGovernment', () => {
  test('should be defined', () => {
    expect(validateUpdateGovernment).toBeDefined();
  });

  test('should be an array with at least 4 validators', () => {
    expect(validateUpdateGovernment.length).toBeGreaterThanOrEqual(4);
  });
});

describe('validateDeleteGovernment', () => {
  test('should be defined', () => {
    expect(validateDeleteGovernment).toBeDefined();
  });

  test('should be an array', () => {
    expect(Array.isArray(validateDeleteGovernment)).toBe(true);
  });
});

describe('validateGetCities', () => {
  test('should be defined', () => {
    expect(validateGetCities).toBeDefined();
  });
});

describe('validateGetCityById', () => {
  test('should be defined', () => {
    expect(validateGetCityById).toBeDefined();
  });
});

describe('validateCreateCity', () => {
  test('should be defined', () => {
    expect(validateCreateCity).toBeDefined();
  });

  test('should have validators for name, nameAr, long, lat, governmentId', () => {
    expect(validateCreateCity.length).toBeGreaterThanOrEqual(5);
  });
});

describe('validateUpdateCity', () => {
  test('should be defined', () => {
    expect(validateUpdateCity).toBeDefined();
  });
});

describe('validateDeleteCity', () => {
  test('should be defined', () => {
    expect(validateDeleteCity).toBeDefined();
  });
});
