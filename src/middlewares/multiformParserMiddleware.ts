import { asyncHandler } from 'src/types/asyncHandler.js';

export const parseFormDataJson = (fieldName: string = 'data') => asyncHandler(async (req, _, next) => {
    try {
      const formData = req.body;
      const parsedBody: any = {};

      for (const [key, value] of Object.entries(formData)) {
        if (key === fieldName && typeof value === 'string') {
          // Parse the stringified JSON
          try {
            parsedBody[key] = JSON.parse(value);
          } catch (e) {
            parsedBody[key] = value; // Fallback to original string if parsing fails
          }
        } else if (value instanceof File) {
          parsedBody[key] = value;
        } else {
          parsedBody[key] = value;
        }
      }

      req.body = parsedBody;
      next();
    } catch (error) {
      next(error);
    }
  });
