import jwt from 'jsonwebtoken';
import environment from '../configs/environment.js';

/**
 * Get token configuration based on payload type
 * @template {keyof import('../types/tokens.js').TokenTypeMap} T
 * @param {import('../types/tokens.js').TokenTypeMap[T]} payload
 * @returns { { secret: string, expiresIn: string } }
 */
function getTokenConfigFromPayload(payload) {
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
 * @template {keyof import('../types/tokens.js').TokenTypeMap} T
 * @param {import('../types/tokens.js').TokenTypeMap[T]} payload
 * @returns {string}
 */
export const generateToken = (payload) => {
  const tokenConfig = getTokenConfigFromPayload(payload);

  const token = jwt.sign(
    { ...payload, tokenType: payload.type },
    tokenConfig.secret,
    { expiresIn: /** @type {import('jsonwebtoken').SignOptions['expiresIn']} */  (tokenConfig.expiresIn) }
  );
  return token;
};

/**
 * Verify and decode token - with type inference
 * @template {keyof import('../types/tokens.js').TokenTypeMap} T
 * @param {string} token
 * @param {T} expectedType
 * @returns {import('../types/tokens.js').TokenTypeMap[T]}
 */
export const verifyAndDecodeToken = (token, expectedType) => {
  const tokenConfig = environment.jwt[expectedType];

  try {

    const decoded = jwt.verify(token, tokenConfig.secret);
    return /** @type {import('../types/tokens.js').TokenTypeMap[T]} */ (decoded);
  } catch (error) {
    throw new Error(`Invalid ${expectedType} token: ${error.message}`);
  }
};
