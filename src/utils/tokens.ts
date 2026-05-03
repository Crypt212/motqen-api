import jwt from 'jsonwebtoken';
import environment from '../configs/environment.js';
import AppError from '../errors/AppError.js';
import { TokenTypeMap } from '../types/tokens.js';

/**
 * Get token configuration based on payload type
 */
function getTokenConfigFromPayload<T extends keyof TokenTypeMap>(
  payload: TokenTypeMap[T]
): { secret: string; expiresIn: string } {
  // Determine token type by checking for type-specific properties
  if ('type' in payload) {
    switch (payload.type) {
      case 'refresh':
        return environment.jwt.refresh;
      case 'access':
        return environment.jwt.access;
      case 'login':
        return environment.jwt.login;
      case 'register':
        return environment.jwt.register;
    }
  }
  return environment.jwt.access;
}

/**
 * Generate a token based on payload type
 */
export function generateToken<T extends keyof TokenTypeMap>(payload: TokenTypeMap[T]): string {
  const tokenConfig = getTokenConfigFromPayload(payload);

  const token = jwt.sign({ ...payload, tokenType: payload.type }, tokenConfig.secret, {
    expiresIn: tokenConfig.expiresIn as jwt.SignOptions['expiresIn'],
  });
  return token;
}

/**
 * Verify and decode token - with type inference
 */
/**
 * Verify and decode token - with type inference
 */
export function verifyAndDecodeToken<T extends keyof TokenTypeMap>(
  token: string,
  expectedType: T
): TokenTypeMap[T] {
  const tokenConfig = environment.jwt[expectedType];

  try {
    // 👈 هنا ضفنا الـ algorithms عشان نمنع ثغرة الـ alg:none
    const decoded = jwt.verify(token, tokenConfig.secret, {
      algorithms: ['HS256'] 
    });
    
    return decoded as TokenTypeMap[T];
  } catch (error) {
    // ملحوظة: لو عاوز الأخطاء تترمي صح وتتمسك في الـ Middleware، 
    // يفضل ترمي AppError بدل Error العادي عشان الـ Error Handler يفهمه
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(`Invalid ${expectedType} token: ${message}`, 401); 
  }
}

/**
 * Verifies and decodes the token from the Authorization header
 */
export function verifyHeaderToken<T extends keyof TokenTypeMap>(
  tokenString: string,
  type: T
): TokenTypeMap[T] {
  if (!tokenString) throw new AppError('Unauthorized, bearer token not found', 401);

  const token = tokenString.split(' ')[1];
  if (!token) throw new AppError('Unauthorized, bad token format', 401);

  const decoded = verifyAndDecodeToken(token, type);
  if (!decoded) throw new AppError('Unauthorized, invalid token', 401);
  return decoded;
}
