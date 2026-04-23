import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { logger } from '../libs/winston.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { z } from 'zod';
import { Request, Response } from 'express';
import ValidationError from '../errors/ValidationError.js';

type Location = 'body' | 'query' | 'params';

interface FormattedError {
  type: string;
  message: string;
}

export const validateZod = (schema: z.ZodTypeAny, location: Location) =>
  asyncHandler((req: Request, _: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[location]);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error));
      return;
    }
    Object.assign(req[location], result.data);
    next();
  });

export const validateExpress = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: FormattedError[] = errors.array().map((err: ExpressValidationError) => ({
      type: err.type,
      message: err.msg,
    }));

    logger.info({ code: 422, errors: formattedErrors });
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }
  next();
});

/**
 * Validates req.body against a Zod schema.
 *
 * @example
 * router.post('/auth/login', validateBody(LoginSchema), authController.login);
 */
export const validateBody = (schema: z.ZodTypeAny) => validateZod(schema, 'body');

/**
 * Validates req.query against a Zod schema.
 * Use z.coerce.number() for numeric query params — they arrive as strings.
 *
 * @example
 * router.get('/users', validateQuery(UsersQuerySchema), userController.list);
 */
export const validateQuery = (schema: z.ZodTypeAny) => validateZod(schema, 'query');

/**
 * Validates req.params against a Zod schema.
 *
 * @example
 * router.get('/users/:id', validateParams(UserIdParamsSchema), userController.get);
 */
export const validateParams = (schema: z.ZodTypeAny) => validateZod(schema, 'params');

type NextFunction = (err?: Error) => void;
