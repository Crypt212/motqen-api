import { body, param } from 'express-validator';

export const validateDraftOrderIdParam = [
  param('draft_order_id')
    .trim()
    .isUUID()
    .withMessage('draft_order_id must be a valid UUID'),
];

export const validateApplyPromo = [
  body('promo_code')
    .trim()
    .notEmpty()
    .withMessage('promo_code is required')
    .isLength({ min: 2, max: 64 })
    .withMessage('promo_code must be between 2 and 64 characters')
    .customSanitizer((value) => String(value).trim().toUpperCase()),
];
