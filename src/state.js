import OTPService from './services/OTPService.js';
import SessionService from './services/SessionService.js';
import UserService from './services/UserService.js';
import OTPRepository from './repositories/OTPRepository.js';
import SessionRepository from './repositories/SessionRepository.js';
import UserRepository from './repositories/UserRepository.js';
import RateLimitRepository from './repositories/RateLimitRepository.js';
import RateLimitService from './services/RateLimitService.js';
import AuthService from './services/AuthService.js';
import GovernmentRepository from './repositories/GovernmentRepository.js';
import SpecializationRepository from './repositories/SpecializationRepository.js';
// state.js  (wire it up like your other repos)

export const rateLimitRepository = new RateLimitRepository();
export const sessionRepository = new SessionRepository();
export const otpRepository = new OTPRepository();
export const userRepository = new UserRepository();
export const specializationRepository = new SpecializationRepository();
export const governmentRepository = new GovernmentRepository();

export const rateLimitService = new RateLimitService(rateLimitRepository);
export const otpService = new OTPService();
export const userService = new UserService();
export const sessionService = new SessionService();
export const authService = new AuthService();
