import OTPService from './services/OTPService.js';
import SessionService from './services/SessionService.js';
import UserService from './services/UserService.js';
import OTPRepository from './repositories/OTPRepository.js';
import SessionRepository from './repositories/SessionRepository.js';
import UserRepository from './repositories/UserRepository.js';
// state.js  (wire it up like your other repos)

import RateLimitRepository from './repositories/rateLimitRepository.js';
import RateLimitService from './services/RateLimitService.js';

export const rateLimitRepository = new RateLimitRepository();
export const rateLimitService = new RateLimitService(rateLimitRepository);

export const otpRepository = new OTPRepository();
export const sessionRepository = new SessionRepository();
export const userRepository = new UserRepository();
export const otpService = new OTPService();
export const userService = new UserService();
export const sessionService = new SessionService();
