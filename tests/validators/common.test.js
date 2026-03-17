/**
 * @fileoverview Tests for common validators
 * @module tests/validators/common
 */

import {
  parseQueryParams,
  createQueryValidator,
  isValidUUID,
  validateField,
  validateJSONField,
  specializationsTreeValidation,
  workGovernmentsValidation,
  mainSpecializationValidation,
  governmentNameValidation,
  cityNameValidation,
  createPaginationValidator,
  createOrderingValidator,
  createFilteringValidator,
  createSearchValidator,
  validateIdParam,
} from '../../src/validators/common.js';

describe('parseQueryParams', () => {
  const config = {
    allowedFilterFields: ['name', 'status', 'governmentId'],
    allowedOrderByFields: ['name', 'createdAt'],
    allowedSearchFields: ['name'],
  };

  describe('pagination', () => {
    test('should return default pagination when no query params provided', () => {
      const result = parseQueryParams({}, config);

      expect(result.pagination).toEqual({ page: 1, limit: 20 });
      expect(result.paginate).toBe(false);
    });

    test('should parse page and limit correctly', () => {
      const result = parseQueryParams({ page: '2', limit: '10' }, config);

      expect(result.pagination).toEqual({ page: 2, limit: 10 });
      expect(result.paginate).toBe(true);
    });

    test('should handle string numbers', () => {
      const result = parseQueryParams({ page: '5', limit: '50' }, config);

      expect(result.pagination).toEqual({ page: 5, limit: 50 });
    });
  });

  describe('filtering', () => {
    test('should return empty filter when no filter params provided', () => {
      const result = parseQueryParams({}, config);

      expect(result.filter).toEqual({});
    });

    test('should parse string filter correctly', () => {
      const result = parseQueryParams({ name: 'John' }, config);

      expect(result.filter).toEqual({ name: 'John' });
    });

    test('should parse uuid filter correctly', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = parseQueryParams({ governmentId: uuid }, config);

      expect(result.filter).toEqual({ governmentId: uuid });
    });

    test('should ignore fields not in allowedFilterFields', () => {
      const result = parseQueryParams(
        { name: 'John', forbiddenField: 'value' },
        config
      );

      expect(result.filter).toEqual({ name: 'John' });
      expect(result.filter.forbiddenField).toBeUndefined();
    });
  });

  describe('search', () => {
    test('should add search to filter as OR clause', () => {
      const result = parseQueryParams({ search: 'test' }, config);

      expect(result.filter).toHaveProperty('OR');
    });

    test('should not add search if no allowedSearchFields', () => {
      const result = parseQueryParams(
        { search: 'test' },
        { allowedFilterFields: [] }
      );

      expect(result.filter).toEqual({});
    });
  });

  describe('ordering', () => {
    test('should return empty orderBy when no sort params provided', () => {
      const result = parseQueryParams({}, config);

      expect(result.orderBy).toEqual([]);
    });

    test('should parse sortBy and sortOrder correctly', () => {
      const result = parseQueryParams(
        { sortBy: 'name', sortOrder: 'desc' },
        config
      );

      expect(result.orderBy).toEqual([{ field: 'name', direction: 'desc' }]);
    });

    test('should default sortOrder to asc', () => {
      const result = parseQueryParams({ sortBy: 'createdAt' }, config);

      expect(result.orderBy).toEqual([
        { field: 'createdAt', direction: 'asc' },
      ]);
    });
  });
});

describe('isValidUUID', () => {
  test('should return true for valid UUID v4', () => {
    expect(isValidUUID('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
  });

  test('should return true for valid UUID v4 with uppercase', () => {
    expect(isValidUUID('123E4567-E89B-42D3-A456-426614174000')).toBe(true);
  });

  test('should return false for invalid UUID', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('123e4567-e89b-42d3-a456')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID(null)).toBe(false);
    expect(isValidUUID(undefined)).toBe(false);
  });
});

describe('createQueryValidator', () => {
  test('should create pagination validators', () => {
    const validators = createQueryValidator({});

    expect(validators.length).toBeGreaterThan(0);
  });

  test('should include orderBy validators when allowedOrderByFields provided', () => {
    const validators = createQueryValidator({
      allowedOrderByFields: ['name', 'createdAt'],
    });

    expect(validators.length).toBeGreaterThan(2);
  });

  test('should include search validators when allowedSearchFields provided', () => {
    const validators = createQueryValidator({
      allowedSearchFields: ['name'],
    });

    expect(validators.length).toBeGreaterThan(2);
  });
});

describe('validateField', () => {
  test('should create required field validator', () => {
    const validator = validateField('name', true);
    expect(validator).toBeDefined();
  });

  test('should create optional field validator', () => {
    const validator = validateField('name', false);
    expect(validator).toBeDefined();
  });
});

describe('validateJSONField', () => {
  test('should create JSON field validator', () => {
    const validator = validateJSONField('data', false);
    expect(validator).toBeDefined();
  });
});

describe('specializationsTreeValidation', () => {
  test('should create specializations tree validator', () => {
    const validator = specializationsTreeValidation('', true);
    expect(validator).toBeDefined();
  });

  test('should create optional specializations tree validator', () => {
    const validator = specializationsTreeValidation('', false);
    expect(validator).toBeDefined();
  });
});

describe('workGovernmentsValidation', () => {
  test('should create work governments validator', () => {
    const validator = workGovernmentsValidation('', true);
    expect(validator).toBeDefined();
  });
});

describe('mainSpecializationValidation', () => {
  test('should create main specialization validator', () => {
    const validator = mainSpecializationValidation('', true);
    expect(validator).toBeDefined();
  });
});

describe('governmentNameValidation', () => {
  test('should create government name validator', () => {
    const validator = governmentNameValidation('', true);
    expect(validator).toBeDefined();
  });
});

describe('cityNameValidation', () => {
  test('should create city name validator', () => {
    const validator = cityNameValidation('', true);
    expect(validator).toBeDefined();
  });
});

describe('createPaginationValidator', () => {
  test('should create pagination validators', () => {
    const validators = createPaginationValidator();
    expect(validators.length).toBe(2);
  });

  test('should respect maxPageSize option', () => {
    const validators = createPaginationValidator({ maxPageSize: 50 });
    expect(validators.length).toBe(2);
  });
});

describe('createOrderingValidator', () => {
  test('should create ordering validators', () => {
    const validators = createOrderingValidator(['name', 'createdAt']);
    expect(validators.length).toBe(2);
  });

  test('should return validators even when no allowedFields', () => {
    const validators = createOrderingValidator([]);
    expect(validators.length).toBe(2);
  });
});

describe('createFilteringValidator', () => {
  test('should create filtering validators', () => {
    const validators = createFilteringValidator({
      allowedFields: ['name', 'status'],
      fieldTypes: { name: { type: 'string' } },
    });
    expect(validators.length).toBeGreaterThan(0);
  });
});

describe('createSearchValidator', () => {
  test('should create search validator', () => {
    const validators = createSearchValidator(['name']);
    expect(validators.length).toBe(1);
  });
});

describe('validateIdParam', () => {
  test('should create UUID id validator by default', () => {
    const validators = validateIdParam('id');
    expect(validators.length).toBe(1);
  });

  test('should create non-UUID id validator when isUUID is false', () => {
    const validators = validateIdParam('slug', false);
    expect(validators.length).toBe(1);
  });
});
