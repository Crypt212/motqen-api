import { body, header, query, param } from 'express-validator';

/** @param {string} type */
export const validateToken = (type) => {
  const capitalizedType = type[0].toUpperCase() + type.slice(1);
  return header('Authorization')
    .trim()
    .notEmpty()
    .withMessage(`${capitalizedType} token is required`)
    .matches(/^Bearer\s/)
    .withMessage(`Invalid ${type} token format`);
};

export const validateDeviceFingerprint = () => {
  return header('x-device-fingerprint').trim();
};

/** @param {string} value */
export const isValidUUID = (value) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * @param {string} fieldName
 * @param {boolean} required
 */
export const validateImageFile = (fieldName, required = false) => {
  return body(fieldName).custom((_, { req }) => {
    if (!req.file && !req.files?.[fieldName]) {
      if (required) {
        throw new Error(`${fieldName} is required`);
      }
      return true;
    }

    const file = req.file || req.files?.[fieldName];

    if (!file) {
      if (required) {
        throw new Error(`${fieldName} must be a file`);
      }
      return true;
    }

    // Validate image type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/bmp',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`${fieldName} must be one of: jpeg, png, bmp, gif`);
    }

    return true;
  });
};

/**
 * @param {string} fieldName
 * @param {boolean} required
 */
export const validateField = (fieldName, required = false) => {
  const b = body(fieldName).trim();

  if (required) b.notEmpty().withMessage(fieldName + ' is required');
  else !required;
  b.optional({ nullable: true, checkFalsy: true });

  return b;
};

/**
 * @param {string} fieldName
 * @param {boolean} required
 */
export const validateJSONField = (fieldName, required = false) => {
  return body(fieldName)
    .custom((_, { req }) => {
      const fieldValue = req.body[fieldName];

      if (!fieldValue && required) {
        throw new Error(`${fieldName} is required`);
      }
      return true;
    })
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    });
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const specializationsTreeValidation = (prefix, required = false) => {
  const fieldName = prefix + 'specializationsTree';

  return validateJSONField(fieldName, required)
    .isArray({ min: 1 })
    .withMessage(fieldName + ' must be a non-empty array')
    .custom((value) => {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== 'object') {
          throw new Error(fieldName + `[${i}] must be an object`);
        }
        if (
          !item.mainId ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            item.mainId
          )
        ) {
          throw new Error(fieldName + `[${i}].mainId must be a valid UUID`);
        }
        if (item.subIds) {
          if (!Array.isArray(item.subIds)) {
            throw new Error(fieldName + `[${i}].subIds must be an array`);
          }
          for (let j = 0; j < item.subIds.length; j++) {
            if (
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                item.subIds[j]
              )
            ) {
              throw new Error(
                fieldName + `[${i}].subIds[${j}] must be a valid UUID`
              );
            }
          }
        }
      }
      return true;
    });
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const workGovernmentsValidation = (prefix, required = false) => {
  const fieldName = prefix + 'workGovernments';
  return validateField(fieldName, required)
    .isArray()
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error(fieldName + ' must be an array');
      } else if (value.length === 0) {
        throw new Error(fieldName + ' must contain at least one government ID');
      } else {
        value.forEach((govId) => {
          if (!isValidUUID(govId)) {
            throw new Error(fieldName + '[${index}] must be a valid UUID');
          }
        });
      }
      return true;
    });
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const mainSpecializationValidation = (prefix, required = false) => {
  const fieldName = prefix + 'mainSpecializationIds';

  return validateField(fieldName, required)
    .isArray()
    .withMessage(fieldName + ' must be an array')
    .custom((value) => {
      if (value) {
        for (let i = 0; i < value.length; i++) {
          if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              value[i]
            )
          ) {
            throw new Error(fieldName + '[${i}] must be a valid UUID');
          }
        }
      }
      return true;
    });
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const governmentNameValidation = (prefix, required = false) => {
  const fieldName = prefix + 'name';
  return validateField(fieldName, required)
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters');
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const cityNameValidation = (prefix, required = false) => {
  const fieldName = prefix + 'name';
  return validateField(fieldName, required)
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters');
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const specializationNameValidation = (prefix, required = false) => {
  const fieldName = prefix + 'name';
  return validateField(fieldName, required)
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters');
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const userDataValidation = (prefix, required = false) => {
  const fieldName = prefix + 'userData';
  return [
    validateJSONField('userData'),
    validateField(fieldName + '.firstName', required).trim(),
    validateField(fieldName + '.middleName', required).trim(),
    validateField(fieldName + '.lastName', required).trim(),
  ];
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const clientProfileValidation = (prefix, required = false) => {
  const fieldName = prefix + 'clientProfile';
  return [
    validateJSONField('clientProfile'),
    validateField(fieldName + '.address', required).trim(),

    validateField(fieldName + '.addressNotes', false).trim(),
  ];
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const workerProfileValidation = (prefix, required = false) => {
  const fieldName = prefix + 'workerProfile';
  return [
    validateJSONField('workerProfile'),
    specializationsTreeValidation(fieldName + '.', required),
    workGovernmentsValidation(fieldName + '.', required),
    validateField(fieldName + '.experienceYears', required)
      .isNumeric()
      .withMessage(fieldName + '.experienceYears must be a number')
      .toInt(),
    validateField(fieldName + '.isInTeam', required)
      .isBoolean()
      .withMessage(fieldName + '.isInTeam must be a boolean'),
    validateField(fieldName + '.acceptsUrgentJobs', required).isBoolean(),
  ];
};

// ============================================
// Dynamic Pagination, Filtering, and Ordering Validators
// ============================================

/**
 * Field type definitions for validation
 * @typedef {Object} FieldTypeDefinition
 * @property {string} type - Type of the field: 'string', 'number', 'boolean', 'uuid', 'date', 'enum'
 * @property {string[]} [enumValues] - For enum type, the allowed values
 * @property {number} [min] - For number type, minimum value
 * @property {number} [max] - For number type, maximum value
 * @property {number} [minLength] - For string type, minimum length
 * @property {number} [maxLength] - For string type, maximum length
 */

/**
 * Configuration for query parameter validation
 * @typedef {Object} QueryValidationConfig
 * @property {string[]} [allowedFilterFields] - Fields that can be used in filters
 * @property {Object.<string, FieldTypeDefinition>} [filterFieldTypes] - Type definitions for filter fields
 * @property {string[]} [allowedOrderByFields] - Fields that can be used for ordering
 * @property {string[]} [allowedSearchFields] - Fields that can be used for search
 * @property {number} [defaultPageSize] - Default page size (default: 20)
 * @property {number} [maxPageSize] - Maximum page size (default: 100)
 */

/**
 * Creates a dynamic validation chain for query parameters
 * This is the main function that makes validation flexible and configurable
 * @param {QueryValidationConfig} config - Configuration for validation
 * @returns {import('express-validator').ValidationChain[]} Array of validation chains
 */
export const createQueryValidator = (config = {}) => {
  const {
    allowedFilterFields = [],
    filterFieldTypes = {},
    allowedOrderByFields = [],
    allowedSearchFields = [],
    defaultPageSize = 20,
    maxPageSize = 100,
  } = config;

  const validations = [];

  // Validate pagination
  validations.push(
    query('page')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer')
      .toInt(),
    query('limit')
      .optional({ nullable: true })
      .isInt({ min: 1, max: maxPageSize })
      .withMessage(`limit must be between 1 and ${maxPageSize}`)
      .toInt()
  );

  // Validate ordering
  if (allowedOrderByFields.length > 0) {
    validations.push(
      query('sortBy')
        .optional({ nullable: true })
        .isString()
        .withMessage('sortBy must be a string')
        .custom((value) => {
          if (value && !allowedOrderByFields.includes(value)) {
            throw new Error(
              `sortBy must be one of: ${allowedOrderByFields.join(', ')}`
            );
          }
          return true;
        }),
      query('sortOrder')
        .optional({ nullable: true })
        .isString()
        .matches(/^(asc|desc)$/i)
        .withMessage('sortOrder must be either "asc" or "desc"')
    );
  }

  // Validate search
  if (allowedSearchFields.length > 0) {
    validations.push(
      query('search')
        .optional({ nullable: true })
        .isString()
        .withMessage('search must be a string')
        .isLength({ min: 2 })
        .withMessage('search must be at least 2 characters')
    );
  }

  // Validate filters dynamically based on allowed fields
  for (const field of allowedFilterFields) {
    const fieldType = filterFieldTypes[field];

    if (!fieldType) {
      // Default to string type if not specified
      validations.push(
        query(field)
          .optional({ nullable: true })
          .isString()
          .withMessage(`${field} must be a string`)
      );
      continue;
    }

    let validator = query(field).optional({ nullable: true });

    switch (fieldType.type) {
      case 'uuid':
        validator = validator.custom((value) => {
          if (value && !isValidUUID(value)) {
            throw new Error(`${field} must be a valid UUID`);
          }
          return true;
        });
        break;
      case 'number':
        validator = validator
          .isNumeric()
          .withMessage(`${field} must be a number`)
          .toFloat();

        if (fieldType.min !== undefined) {
          validator = validator.custom((value) => {
            if (value !== undefined && value < fieldType.min) {
              throw new Error(`${field} must be at least ${fieldType.min}`);
            }
            return true;
          });
        }
        if (fieldType.max !== undefined) {
          validator = validator.custom((value) => {
            if (value !== undefined && value > fieldType.max) {
              throw new Error(`${field} must be at most ${fieldType.max}`);
            }
            return true;
          });
        }
        break;
      case 'boolean':
        validator = validator
          .isBoolean()
          .withMessage(`${field} must be a boolean`)
          .toBoolean();
        break;
      case 'date':
        validator = validator
          .isISO8601()
          .withMessage(`${field} must be a valid date`)
          .toDate();
        break;
      case 'enum':
        if (fieldType.enumValues) {
          validator = validator.custom((value) => {
            if (value && !fieldType.enumValues.includes(value)) {
              throw new Error(
                `${field} must be one of: ${fieldType.enumValues.join(', ')}`
              );
            }
            return true;
          });
        }
        break;
      case 'string':
      default:
        if (fieldType.minLength !== undefined) {
          validator = validator.isLength({ min: fieldType.minLength });
        }
        if (fieldType.maxLength !== undefined) {
          validator = validator.isLength({ max: fieldType.maxLength });
        }
        break;
    }

    validations.push(validator);
  }

  return validations;
};

/**
 * Creates pagination validation only
 * @param {Object} options
 * @param {number} [options.defaultPageSize=20]
 * @param {number} [options.maxPageSize=100]
 * @returns {import('express-validator').ValidationChain[]}
 */
export const createPaginationValidator = (options = {}) => {
  const { defaultPageSize = 20, maxPageSize = 100 } = options;

  return [
    query('page')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('page must be a positive integer')
      .toInt(),
    query('limit')
      .optional({ nullable: true })
      .isInt({ min: 1, max: maxPageSize })
      .withMessage(`limit must be between 1 and ${maxPageSize}`)
      .toInt(),
  ];
};

/**
 * Creates ordering validation with allowed fields
 * @param {string[]} allowedFields - Fields that can be used for ordering
 * @returns {import('express-validator').ValidationChain[]}
 */
export const createOrderingValidator = (allowedFields = []) => {
  return [
    query('sortBy')
      .optional({ nullable: true })
      .isString()
      .withMessage('sortBy must be a string')
      .custom((value) => {
        if (
          value &&
          allowedFields.length > 0 &&
          !allowedFields.includes(value)
        ) {
          throw new Error(`sortBy must be one of: ${allowedFields.join(', ')}`);
        }
        return true;
      }),
    query('sortOrder')
      .optional({ nullable: true })
      .isString()
      .matches(/^(asc|desc)$/i)
      .withMessage('sortOrder must be either "asc" or "desc"'),
  ];
};

/**
 * Creates filtering validation with allowed fields and their types
 * @param {Object} options
 * @param {string[]} options.allowedFields - Fields that can be used for filtering
 * @param {Object.<string, FieldTypeDefinition>} options.fieldTypes - Type definitions for filter fields
 * @returns {import('express-validator').ValidationChain[]}
 */
export const createFilteringValidator = (
  { allowedFields = [], fieldTypes = {} } = {
    allowedFields: [],
    fieldTypes: {},
  }
) => {
  const validations = [];

  for (const field of allowedFields) {
    const fieldType = fieldTypes[field];

    if (!fieldType) {
      validations.push(query(field).optional({ nullable: true }).isString());
      continue;
    }

    let validator = query(field).optional({ nullable: true });

    switch (fieldType.type) {
      case 'uuid':
        validator = validator.custom((value) => {
          if (value && !isValidUUID(value)) {
            throw new Error(`${field} must be a valid UUID`);
          }
          return true;
        });
        break;
      case 'number':
        validator = validator
          .isNumeric()
          .withMessage(`${field} must be a number`)
          .toFloat();
        break;
      case 'boolean':
        validator = validator
          .isBoolean()
          .withMessage(`${field} must be a boolean`)
          .toBoolean();
        break;
      case 'date':
        validator = validator
          .isISO8601()
          .withMessage(`${field} must be a valid date`);
        break;
      case 'enum':
        if (fieldType.enumValues) {
          validator = validator.custom((value) => {
            if (value && !fieldType.enumValues.includes(value)) {
              throw new Error(
                `${field} must be one of: ${fieldType.enumValues.join(', ')}`
              );
            }
            return true;
          });
        }
        break;
    }

    validations.push(validator);
  }

  return validations;
};

/**
 * Creates search validation with allowed fields
 * @param {string[]} allowedFields - Fields that can be used for search
 * @param {number} [minLength=2] - Minimum search query length
 * @returns {import('express-validator').ValidationChain[]}
 */
export const createSearchValidator = (allowedFields = [], minLength = 2) => {
  return [
    query('search')
      .optional({ nullable: true })
      .isString()
      .withMessage('search must be a string')
      .isLength({ min: minLength })
      .withMessage(`search must be at least ${minLength} characters`)
      .custom((value, { req }) => {
        if (value && allowedFields.length > 0) {
          // Store search field in req for later use (not validated against allowedFields in query)
          req.querySearchFields = allowedFields;
        }
        return true;
      }),
  ];
};

/**
 * Creates date range validation
 * @param {string} dateField - The date field name
 * @returns {import('express-validator').ValidationChain[]}
 */
export const createDateRangeValidator = (dateField = 'date') => {
  return [
    query(`${dateField}From`)
      .optional({ nullable: true })
      .isISO8601()
      .withMessage(`${dateField}From must be a valid date`)
      .toDate(),
    query(`${dateField}To`)
      .optional({ nullable: true })
      .isISO8601()
      .withMessage(`${dateField}To must be a valid date`)
      .toDate()
      .custom((value, { req }) => {
        const fromDate = req.query[`${dateField}From`];
        if (fromDate && value && new Date(value) < new Date(fromDate)) {
          throw new Error(
            `${dateField}To must be greater than or equal to ${dateField}From`
          );
        }
        return true;
      }),
  ];
};

/**
 * Creates validation for ID parameters in URL
 * @param {string} paramName - The parameter name (e.g., 'id', 'userId')
 * @param {boolean} [isUUID=true] - Whether the ID should be a UUID
 * @returns {import('express-validator').ValidationChain[]}
 */
export const validateIdParam = (paramName = 'id', isUUID = true) => {
  const validator = param(paramName)
    .notEmpty()
    .withMessage(`${paramName} is required`)
    .isString()
    .withMessage(`${paramName} must be a string`);

  if (isUUID) {
    return [
      validator.custom((value) => {
        if (!isValidUUID(value)) {
          throw new Error(`${paramName} must be a valid UUID`);
        }
        return true;
      }),
    ];
  }

  return [validator];
};

// ============================================
// Helper function to parse validated query parameters
// ============================================

/**
 * Parses validated query parameters into repository-friendly format
 * @param {Object} query - The validated query object
 * @param {Object} config - Configuration for parsing
 * @param {string[]} [config.allowedFilterFields] - Allowed filter fields
 * @param {string[]} [config.allowedOrderByFields] - Allowed order by fields
 * @param {string[]} [config.allowedSearchFields] - Allowed search fields
 * @returns {Object} - { filter, pagination, orderBy, paginate }
 */
export const parseQueryParams = (query, config = {}) => {
  const {
    allowedFilterFields = [],
    allowedOrderByFields = [],
    allowedSearchFields = [],
  } = config;

  // Determine if pagination is requested
  const paginate = query.page !== undefined || query.limit !== undefined;

  // Parse pagination
  const pagination = {
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 20,
  };

  // Build where clause from filters (renamed to filter for consistency with services)
  const filter = {};

  for (const field of allowedFilterFields) {
    if (
      query[field] !== undefined &&
      query[field] !== null &&
      query[field] !== ''
    ) {
      filter[field] = query[field];
    }
  }

  // Add search condition if applicable
  if (query.search && allowedSearchFields.length > 0) {
    filter.OR = allowedSearchFields.map((field) => ({
      [field]: { contains: query.search, mode: 'insensitive' },
    }));
  }

  // Build orderBy
  const orderBy = [];
  if (query.sortBy && allowedOrderByFields.includes(query.sortBy)) {
    orderBy.push({
      field: query.sortBy,
      direction: query.sortOrder?.toLowerCase() || 'asc',
    });
  }

  return {
    filter,
    pagination,
    orderBy,
    paginate,
  };
};
