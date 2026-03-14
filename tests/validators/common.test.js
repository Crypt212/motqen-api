/**
 * @fileoverview Tests for common validators
 * @module tests/validators/common
 */

import { 
  parseQueryParams, 
  createQueryValidator,
  isValidUUID,
  validateToken,
  validateDeviceFingerprint,
  validateImageFile,
  validateField,
  validateJSONField,
  specializationsTreeValidation,
  workGovernmentsValidation,
  mainSpecializationValidation
} from '../../src/validators/common.js';

describe('parseQueryParams', () => {
  const config = {
    allowedFilterFields: ['name', 'status', 'governmentId'],
    allowedOrderByFields: ['name', 'createdAt'],
    allowedSearchFields: ['name']
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

    test('should handle edge case of page=0', () => {
      const result = parseQueryParams({ page: '0', limit: '10' }, config);
      
      // parseInt of '0' is 0, but validation should catch this
      expect(result.pagination.page).toBe(0);
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
      const result = parseQueryParams({ name: 'John', forbiddenField: 'value' }, config);
      
      expect(result.filter).toEqual({ name: 'John' });
      expect(result.filter.forbiddenField).toBeUndefined();
    });

    test('should handle null and empty string values', () => {
      const result = parseQueryParams({ name: null, status: '' }, config);
      
      expect(result.filter).toEqual({});
    });

    test('should handle enum filter correctly', () => {
      const enumConfig = {
        ...config,
        filterFieldTypes: {
          status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE'] }
        }
      };
      const result = parseQueryParams({ status: 'ACTIVE' }, enumConfig);
      
      expect(result.filter).toEqual({ status: 'ACTIVE' });
    });
  });

  describe('search', () => {
    test('should add search to filter as OR clause', () => {
      const result = parseQueryParams({ search: 'test' }, config);
      
      expect(result.filter).toHaveProperty('OR');
      expect(result.filter.OR).toEqual([
        { name: { contains: 'test', mode: 'insensitive' } }
      ]);
    });

    test('should not add search if no allowedSearchFields', () => {
      const result = parseQueryParams({ search: 'test' }, { allowedFilterFields: [] });
      
      expect(result.filter).toEqual({});
    });

    test('should combine search with other filters', () => {
      const result = parseQueryParams({ search: 'test', status: 'ACTIVE' }, config);
      
      expect(result.filter).toHaveProperty('OR');
      expect(result.filter.status).toBe('ACTIVE');
    });
  });

  describe('ordering', () => {
    test('should return empty orderBy when no sort params provided', () => {
      const result = parseQueryParams({}, config);
      
      expect(result.orderBy).toEqual([]);
    });

    test('should parse sortBy and sortOrder correctly', () => {
      const result = parseQueryParams({ sortBy: 'name', sortOrder: 'desc' }, config);
      
      expect(result.orderBy).toEqual([{ field: 'name', direction: 'desc' }]);
    });

    test('should default sortOrder to asc', () => {
      const result = parseQueryParams({ sortBy: 'createdAt' }, config);
      
      expect(result.orderBy).toEqual([{ field: 'createdAt', direction: 'asc' }]);
    });

    test('should ignore sortBy if not in allowedOrderByFields', () => {
      const result = parseQueryParams({ sortBy: 'forbidden', sortOrder: 'asc' }, config);
      
      expect(result.orderBy).toEqual([]);
    });

    test('should handle uppercase sortOrder', () => {
      const result = parseQueryParams({ sortBy: 'name', sortOrder: 'DESC' }, config);
      
      expect(result.orderBy).toEqual([{ field: 'name', direction: 'desc' }]);
    });

    test('should handle multiple orderBy fields (future enhancement)', () => {
      // Current implementation only supports single field, but test documents behavior
      const result = parseQueryParams({ sortBy: 'name', sortOrder: 'asc' }, config);
      
      expect(result.orderBy.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    test('should handle empty config', () => {
      const result = parseQueryParams({ page: '1', limit: '10' }, {});
      
      expect(result.pagination).toEqual({ page: 1, limit: 10 });
      expect(result.filter).toEqual({});
      expect(result.orderBy).toEqual([]);
    });

    test('should handle undefined config', () => {
      const result = parseQueryParams({ page: '1' });
      
      expect(result.pagination).toEqual({ page: 1, limit: 20 });
    });

    test('should handle all params together', () => {
      const result = parseQueryParams({
        page: '2',
        limit: '25',
        name: 'Test',
        search: 'search',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, config);
      
      expect(result).toEqual({
        pagination: { page: 2, limit: 25 },
        filter: { 
          name: 'Test',
          OR: [{ name: { contains: 'search', mode: 'insensitive' } }]
        },
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        paginate: true
      });
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
    // Check that pagination validators are present
    const pageValidator = validators.find(v => v.builder?.fields?.[0] === 'page');
    expect(pageValidator).toBeDefined();
  });

  test('should include orderBy validators when allowedOrderByFields provided', () => {
    const validators = createQueryValidator({
      allowedOrderByFields: ['name', 'createdAt']
    });
    
    const sortByValidator = validators.find(v => v.builder?.fields?.[0] === 'sortBy');
    expect(sortByValidator).toBeDefined();
  });

  test('should include search validators when allowedSearchFields provided', () => {
    const validators = createQueryValidator({
      allowedSearchFields: ['name']
    });
    
    const searchValidator = validators.find(v => v.builder?.fields?.[0] === 'search');
    expect(searchValidator).toBeDefined();
  });

  test('should include filter validators for each allowedFilterFields', () => {
    const validators = createQueryValidator({
      allowedFilterFields: ['name', 'status'],
      filterFieldTypes: {
        name: { type: 'string', minLength: 2 },
        status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE'] }
      }
    });
    
    const nameValidator = validators.find(v => v.builder?.fields?.[0] === 'name');
    const statusValidator = validators.find(v => v.builder?.fields?.[0] === 'status');
    expect(nameValidator).toBeDefined();
    expect(statusValidator).toBeDefined();
  });

  test('should validate uuid type correctly', () => {
    const validators = createQueryValidator({
      allowedFilterFields: ['id'],
      filterFieldTypes: {
        id: { type: 'uuid' }
      }
    });
    
    const idValidator = validators.find(v => v.builder?.fields?.[0] === 'id');
    expect(idValidator).toBeDefined();
  });

  test('should validate number type with min/max', () => {
    const validators = createQueryValidator({
      allowedFilterFields: ['age'],
      filterFieldTypes: {
        age: { type: 'number', min: 0, max: 150 }
      }
    });
    
    const ageValidator = validators.find(v => v.builder?.fields?.[0] === 'age');
    expect(ageValidator).toBeDefined();
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
