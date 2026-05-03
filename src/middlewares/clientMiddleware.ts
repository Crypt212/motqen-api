import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * Disallows client users to access the route
 */
export const unAuthorizeClient = asyncHandler(async (req, _, next) => {
  // 1. التأكد من وجود بيانات المستخدم أولاً
  if (!req.userState) return next(new AppError('Not authenticated', 401));

  // 2. رفض المستخدم لو هو عميل
  if (req.userState.client) 
    return next(new AppError('Forbidden: Unauthorized access for client users', 403));

  next();
});

/**
 * Allows only client users to access the route
 */
export const authorizeClient = asyncHandler(async (req, _, next) => {
  // 1. التأكد من وجود بيانات المستخدم أولاً
  if (!req.userState) return next(new AppError('Not authenticated', 401));

  // 2. التأكد إن المستخدم عميل
  if (!req.userState.client)
    return next(new AppError('Forbidden: Unauthorized access for non-client users', 403));

  next();
});