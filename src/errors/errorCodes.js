export const DEFAULT_ERROR_CODES_BY_STATUS = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'CONFLICT',
  410: 'RESOURCE_EXPIRED',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

/**
 * Normalize custom error code to machine-readable UPPER_SNAKE_CASE.
 * @param {unknown} errorCode
 * @returns {string | null}
 */
export function normalizeErrorCode(errorCode) {
  if (typeof errorCode !== 'string') return null;
  const normalized = errorCode
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();

  return normalized || null;
}

/**
 * Resolve an error code from explicit error code, status code, or fallback.
 * @param {number} statusCode
 * @param {unknown} explicitErrorCode
 * @returns {string}
 */
export function resolveErrorCode(statusCode, explicitErrorCode) {
  const normalized = normalizeErrorCode(explicitErrorCode);
  if (normalized) return normalized;
  return DEFAULT_ERROR_CODES_BY_STATUS[statusCode] || 'INTERNAL_SERVER_ERROR';
}
