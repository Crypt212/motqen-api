import { Request, Response, NextFunction } from 'express';

/**
 * Parses specified fields from multipart form as JSON.
 * Run this after multer, before validateBody.
 *
 * Usage:
 *   router.post('/register', upload, parseMultipartJson(['userData', 'workerProfile']), validateBody(Schema), controller)
 */
export const parseMultipartJson =
  (fields: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    for (const field of fields) {
      const value = req.body[field];
      if (typeof value === 'string') {
        try {
          req.body[field] = JSON.parse(value);
        } catch {
          res.status(400).json({
            error: 'Validation failed',
            details: { [field]: [`${field} must be valid JSON`] },
          });
          return;
        }
      }
    }
    next();
  };
