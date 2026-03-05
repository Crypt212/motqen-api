import { body, header } from 'express-validator';

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

export const isValidUUID = (value) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const validateImageFile = (fieldName, required = true) => {
  return body(fieldName)
    .custom((value, { req }) => {
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
      // if (!allowedMimeTypes.includes(file.mimetype)) {
      //   throw new Error(`${fieldName} must be one of: jpeg, png, bmp, gif`);
      // }

      return true;
    });
};

export const validateJSONField = (fieldName, required = true) => {
  return body(fieldName)
    .custom((value, { req }) => {
      const fieldValue = req.body[fieldName];

      if (!fieldValue && required) {
        throw new Error(`${fieldName} is required`);
      }

      if (fieldValue) {
        try {
          // Try to parse if it's a string
          const parsed = typeof fieldValue === 'string'
            ? JSON.parse(fieldValue)
            : fieldValue;
          return true;
        } catch (error) {
          console.log(error)
          throw new Error(`${fieldName} must be a valid JSON string`);
        }
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

export const optionalSpecializationsTreeValidation = (prefix) =>
  body(prefix + "specializationsTree")
    .optional({ nullable: true, checkFalsy: true })
    .isArray({ min: 1 })
    .withMessage(prefix + "specializationsTree must be a non-empty array")
    .custom((value) => {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== 'object') {
          throw new Error(prefix + `specializationsTree[${i}] must be an object`);
        }
        if (!item.mainId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.mainId)) {
          throw new Error(prefix + `specializationsTree[${i}].mainId must be a valid UUID`);
        }
        if (item.subIds) {
          if (!Array.isArray(item.subIds)) {
            throw new Error(prefix + `specializationsTree[${i}].subIds must be an array`);
          }
          for (let j = 0; j < item.subIds.length; j++) {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.subIds[j])) {
              throw new Error(prefix + `specializationsTree[${i}].subIds[${j}] must be a valid UUID`);
            }
          }
        }
      }
      return true;
    });

export const specializationsTreeValidation = (prefix) =>
  body(prefix + "specializationsTree")
    .notEmpty()
    .isArray({ min: 1 })
    .withMessage(prefix + "specializationsTree must be a non-empty array")
    .custom((value) => {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== 'object') {
          throw new Error(prefix + `specializationsTree[${i}] must be an object`);
        }
        if (!item.mainId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.mainId)) {
          throw new Error(prefix + `specializationsTree[${i}].mainId must be a valid UUID`);
        }
        if (item.subIds) {
          if (!Array.isArray(item.subIds)) {
            throw new Error(prefix + `specializationsTree[${i}].subIds must be an array`);
          }
          for (let j = 0; j < item.subIds.length; j++) {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.subIds[j])) {
              throw new Error(prefix + `specializationsTree[${i}].subIds[${j}] must be a valid UUID`);
            }
          }
        }
      }
      return true;
    });

export const optionalWorkGovernmentsValidation = (prefix) =>
  body(prefix + "workGovernmentIds")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .custom((value, { req }) => {
      if (!value) {
        throw new Error(prefix + 'workGovernmentIds is required');
      } else if (!Array.isArray(value)) {
        throw new Error(prefix + 'workGovernmentIds must be an array');
      } else if (value.length === 0) {
        throw new Error(prefix + 'workGovernmentIds must contain at least one government ID');
      } else {
        value.forEach((govId, index) => {
          if (!isValidUUID(govId)) {
            throw new Error(prefix + `workGovernmentIds[${index}] must be a valid UUID`);
          }
        });
      }
      return true;
    });

export const workGovernmentsValidation = (prefix) =>
  body(prefix + "workGovernmentIds")
    .notEmpty()
    .isArray()
    .custom((value, { req }) => {
      // workGovernmentIds validation
      if (!value) {
        throw new Error(prefix + 'workGovernmentIds is required');
      } else if (!Array.isArray(value)) {
        throw new Error(prefix + 'workGovernmentIds must be an array');
      } else if (value.length === 0) {
        throw new Error(prefix + 'workGovernmentIds must contain at least one government ID');
      } else {
        value.forEach((govId, index) => {
          if (!isValidUUID(govId)) {
            throw new Error(prefix + `workGovernmentIds[${index}] must be a valid UUID`);
          }
        });
      }
      return true;
    });

export const optionalMainSpecializationValidation = (prefix) =>
  body(prefix + "mainSpecializationIds")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage(prefix + "mainSpecializationIds must be an array")
    .custom((value) => {
      if (value) {
        for (let i = 0; i < value.length; i++) {
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value[i])) {
            throw new Error(prefix + `mainSpecializationIds[${i}] must be a valid UUID`);
          }
        }
      }
      return true;
    });

export const mainSpecializationValidation = (prefix) =>
  body(prefix + "mainSpecializationIds")
    .notEmpty()
    .isArray()
    .withMessage(prefix + "mainSpecializationIds must be an array")
    .custom((value) => {
      if (value) {
        for (let i = 0; i < value.length; i++) {
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value[i])) {
            throw new Error(prefix + `mainSpecializationIds[${i}] must be a valid UUID`);
          }
        }
      }
      return true;
    });


export const optionalUserDataValidation = [
  body('userData.firstName')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.firstName must be at least 2 characters long"),
  body('userData.middleName')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.middleName must be at least 2 characters long"),
  body('userData.lastName')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.lastName must be at least 2 characters long"),
  body('userData.governmentId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isUUID()
    .withMessage("userData.governmentId must be a valid UUID")
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.governmentId must be at least 2 characters long"),
  body('userData.cityId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.cityId must be at least 2 characters long"),
];

export const userDataValidation = [
  body('userData.firstName')
    .trim()
    .notEmpty()
    .withMessage("userData.firstName is required"),
  body('userData.middleName')
    .trim()
    .notEmpty()
    .withMessage("userData.middleName is required"),
  body('userData.lastName')
    .trim()
    .notEmpty()
    .withMessage("userData.lastName is required"),
  body('userData.governmentId')
    .trim()
    .notEmpty()
    .withMessage("userData.governmentId is required")
    .isUUID()
    .withMessage("userData.governmentId must be a valid UUID"),
  body('userData.cityId')
    .trim()
    .notEmpty()
    .withMessage("userData.cityId is required")
];

export const optionalClientProfileValidation = [
  body('clientProfile.address')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('clientProfile.addressNotes')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
]

export const clientProfileValidation = [
  body('clientProfile.address')
    .trim()
    .notEmpty()
    .withMessage("clientProfile.address is required"),

  body('clientProfile.addressNotes')
    .trim(),
]


export const optionalWorkerProfileValidation = [
  optionalSpecializationsTreeValidation("workerProfile."),
  optionalWorkGovernmentsValidation("workerProfile."),
  body("workerProfile.experienceYears")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isNumeric()
    .withMessage("workerProfile.experienceYears must be a number")
    .toInt(),
  body("workerProfile.isInTeam")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isBoolean()
    .withMessage("workerProfile.isInTeam must be a boolean"),
  body("workerProfile.acceptsUrgentJobs")
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
];

export const workerProfileValidation = [
  specializationsTreeValidation("workerProfile."),
  workGovernmentsValidation("workerProfile."),
  body("workerProfile.experienceYears")
    .trim()
    .notEmpty()
    .withMessage("workerProfile.experienceYears is required")
    .isNumeric()
    .withMessage("workerProfile.experienceYears must be a number")
    .toInt(),
  body("workerProfile.isInTeam")
    .trim()
    .notEmpty()
    .withMessage("workerProfile.isInTeam is required")
    .isBoolean()
    .withMessage("workerProfile.isInTeam must be a boolean"),
  body("workerProfile.acceptsUrgentJobs")
    .isBoolean()
    .notEmpty()
]
