import { body, header } from 'express-validator';

export const validateToken = (type) =>  {
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
