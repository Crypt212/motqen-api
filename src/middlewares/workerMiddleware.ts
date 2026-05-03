import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * Disallows worker users to access the route
 */
export const unAuthorizeWorker = asyncHandler(async (req, _, next) => {
  // 1. التأكد من وجود بيانات المستخدم أولاً
  if (!req.userState) return next(new AppError('Not authenticated', 401));

  // 2. إصلاح الـ Bug: هنا المفروض نرفضه لو هو عامل فعلاً (بدون علامة التعجب)
  if (req.userState.worker) 
    return next(new AppError('Forbidden: Unauthorized access for worker users', 403));

  next();
});

/**
 * Allows only worker users to access the route
 */
export const authorizeWorker = asyncHandler(async (req, _, next) => {
  // 1. التأكد من وجود بيانات المستخدم أولاً
  if (!req.userState) return next(new AppError('Not authenticated', 401));

  // 2. التأكد إن المستخدم عامل
  if (!req.userState.worker)
    return next(new AppError('Forbidden: Unauthorized access for non-worker users', 403));
  
  // 3. التأكد من حالة الموافقة (البيزنس لوجيك بتاعك زي ما هو)
  if (req.userState.worker.verification.status !== 'APPROVED')
    return next(new AppError('Forbidden: You are not approved yet', 403));

  next();
});