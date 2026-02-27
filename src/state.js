import UserService from './services/UserService.js';
import OTPCache from './repositories/cache/OTPCache.js';
import SessionRepository from './repositories/database/SessionRepository.js';
import UserRepository from './repositories/database/UserRepository.js';
import RateLimitCache from './repositories/cache/RateLimitCache.js';
import RateLimitService from './services/RateLimitService.js';
import AuthService from './services/AuthService.js';
import GovernmentRepository from './repositories/database/GovernmentRepository.js';
import SpecializationRepository from './repositories/database/SpecializationRepository.js';
import ClientService from './services/ClientService.js';
import WorkerService from './services/WorkerService.js';
import prisma from './libs/database.js';
// state.js  (wire it up like your other repos)

export const rateLimitCache = new RateLimitCache();
export const otpCache = new OTPCache();
export const sessionRepository = new SessionRepository(prisma);
export const userRepository = new UserRepository(prisma);
export const specializationRepository = new SpecializationRepository(prisma);
export const governmentRepository = new GovernmentRepository(prisma);

export const rateLimitService = new RateLimitService({ rateLimitCache });
export const userService = new UserService({ userRepository, governmentRepository });
export const clientService = new ClientService({ userRepository });
export const workerService = new WorkerService({ userRepository });
export const authService = new AuthService({ userRepository, governmentRepository, otpCache, sessionRepository, rateLimitCache });
