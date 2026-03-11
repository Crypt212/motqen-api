import { body, header } from 'express-validator';

/** @param {string} type */
export const validateToken = (type) => {
  const capitalizedType = type[0].toUpperCase() + type.slice(1);
  return header("Authorization")
    .trim()
    .notEmpty()
    .withMessage(`${capitalizedType} token is required`)
    .matches(/^Bearer\s/)
    .withMessage(`Invalid ${type} token format`);
}

export const validateDeviceFingerprint = () => {
  return header("x-device-fingerprint")
    .trim()
}

/** @param {string} value */
export const isValidUUID = (value) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * @param {string} fieldName
 * @param {boolean} required
 */
export const validateImageFile = (fieldName, required = false) => {
  return body(fieldName)
    .custom((_, { req }) => {
      if (!req.file && !req.files?.[fieldName]) {
        if (required) {
          throw new Error(`${fieldName} is required`);
        }
        return true;
      }

      const file = req.file || req.files?.[fieldName];

      // Check if it's a file (in multer, files are added to req.file or req.files)
      if (!file/* || !file.mimetype*/) {
        if (required) {
          throw new Error(`${fieldName} must be a file`);
        }
        return true;
      }

      // Validate image type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'];
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

  if (required)
    b.notEmpty().withMessage(fieldName + " is required")
  else (!required)
  b.optional({ nullable: true, checkFalsy: true })

  return b
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
      // Sanitize by parsing if it's a string
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
  const fieldName = prefix + "specializationsTree";

  return validateField(fieldName, required)
    .isArray({ min: 1 })
    .withMessage(fieldName + " must be a non-empty array")
    .custom((value) => {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== 'object') {
          throw new Error(fieldName + `[${i}] must be an object`);
        }
        if (!item.mainId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.mainId)) {
          throw new Error(fieldName + `[${i}].mainId must be a valid UUID`);
        }
        if (item.subIds) {
          if (!Array.isArray(item.subIds)) {
            throw new Error(fieldName + `[${i}].subIds must be an array`);
          }
          for (let j = 0; j < item.subIds.length; j++) {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.subIds[j])) {
              throw new Error(fieldName + `[${i}].subIds[${j}] must be a valid UUID`);
            }
          }
        }
      }
      return true;
    });
}

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const workGovernmentsValidation = (prefix, required = false) => {
  const fieldName = prefix + "workGovernments";
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
}

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const mainSpecializationValidation = (prefix, required = false) => {
  const fieldName = prefix + "mainSpecializationIds";

  return validateField(fieldName, required)
    .isArray()
    .withMessage(fieldName + " must be an array")
    .custom((value) => {
      if (value) {
        for (let i = 0; i < value.length; i++) {
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value[i])) {
            throw new Error(fieldName + "[${i}] must be a valid UUID");
          }
        }
      }
      return true;
    });
}



/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const userDataValidation = (prefix, required = false) => {
  const fieldName = prefix + "userData";
  return [
    validateJSONField("userData"),
    validateField(fieldName + '.firstName', required)
      .trim(),
    validateField(fieldName + '.middleName', required)
      .trim(),
    validateField(fieldName + '.lastName', required)
      .trim(),
    validateField(fieldName + '.governmentId', required)
      .trim()
      .isUUID()
      .withMessage(fieldName + '.governmentId must be a valid UUID'),
    validateField(fieldName + '.cityId', required)
      .trim(),
  ]
};

/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const clientProfileValidation = (prefix, required = false) => {
  const fieldName = prefix + 'clientProfile';
  return [
    validateJSONField("clientProfile"),
    validateField(fieldName + '.address', required)
      .trim(),

    validateField(fieldName + '.addressNotes', false)
      .trim(),
  ]
};


/**
 * @param {string} prefix
 * @param {boolean} required
 */
export const workerProfileValidation = (prefix, required = false) => {
  const fieldName = prefix + 'workerProfile';
  return [
    validateJSONField("workerProfile"),
    specializationsTreeValidation(fieldName + ".", required),
    workGovernmentsValidation(fieldName + ".", required),
    validateField(fieldName + ".experienceYears", required)
      .isNumeric()
      .withMessage(fieldName + ".experienceYears must be a number")
      .toInt(),
    validateField(fieldName + ".isInTeam", required)
      .isBoolean()
      .withMessage(fieldName + ".isInTeam must be a boolean"),
    validateField(fieldName + ".acceptsUrgentJobs", required)
      .isBoolean()
  ]
}
