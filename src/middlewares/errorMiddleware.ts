/**
 * @fileoverview Error Middleware - Global error handling with sensitive data protection
 * @module middlewares/errorHandler
 */

import { logger } from '../libs/winston.js';
import RepositoryError from '../errors/RepositoryError.js';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError.js';
import OperationalError from '../errors/OperationalError.js';
import environment from '../configs/environment.js';
import ValidationError from '../errors/ValidationError.js';

// Regex لاكتشاف أنماط أرقام التليفونات في رسائل الخطأ - [Point 2 in S1.2]
const PHONE_PATTERN = /(\+20|0020|02)?01[0125]\d{8}/g;

const errorHandler: ErrorRequestHandler = function (
  err: unknown,
  _: Request,
  res: Response,
  __: NextFunction
) {
  // تسجيل الخطأ بالكامل في الـ Logger للمطورين فقط [Point 10]
  logger.info(err);

  if (!(err instanceof Error)) {
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred',
    });
  }

  // 1. أخطاء قاعدة البيانات (Prisma/DB Errors) - [Point 7 & Point 4 in S1.2] 🛡️
  if (err instanceof RepositoryError) {
    return res.status(500).json({
      status: 'error',
      // منع تسريب كود الخطأ أو تفاصيل الـ Schema في الـ Production
      message: environment.nodeEnv === 'development' 
        ? `Database error: ${err.code} - ${err.message}`.replace(PHONE_PATTERN, '[PHONE_HIDDEN]')
        : 'A database error occurred. Please try again later.',
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  }

  // 2. أخطاء النظام غير المعروفة - [Point 7 & Point 3 in S1.2] 🛡️
  if (!(err instanceof OperationalError)) {
    return res.status(500).json({
      status: 'error',
      message: environment.nodeEnv === 'development' 
        ? err.message.replace(PHONE_PATTERN, '[PHONE_HIDDEN]') 
        : 'Something went wrong on our end',
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  }

  // 3. أخطاء التحقق من البيانات (Validation Errors) - [Point 2 in S1.2] 🛡️
  if (err instanceof ValidationError) {
    // تنظيف كائن الـ issues من أي أرقام تليفونات قد تكون تسربت من الـ Validator
    const sanitizedIssues = JSON.parse(
        JSON.stringify(err.issues).replace(PHONE_PATTERN, '[PHONE_HIDDEN]')
    );

    return res.status(422).json({
      status: 'fail',
      message: err.message.replace(PHONE_PATTERN, '[PHONE_HIDDEN]'),
      issues: sanitizedIssues,
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  } 
  
  // 4. أخطاء التطبيق المخصصة (AppError)
  if (err instanceof AppError) {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    if (statusCode === 429) {
      const details = err.details && err.details.toJSON();
      if (details && 'retryAfter' in details && typeof details.retryAfter === 'number') {
        res.setHeader('Retry-After', String(Math.max(1, Math.ceil(details.retryAfter))));
      }
    }

    return res.status(statusCode).json({
      status,
      message: err.message.replace(PHONE_PATTERN, '[PHONE_HIDDEN]'),
      details: err.details && err.details.toJSON(),
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  }

  // Fallback لأي حالة غير مغطاة
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export default errorHandler;