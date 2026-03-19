import UserService from './services/UserService.js';
import OTPCache from './repositories/cache/OTPCache.js';
import SessionRepository from './repositories/database/SessionRepository.js';
import UserRepository from './repositories/database/UserRepository.js';
import WorkerRepository from './repositories/database/WorkerRepository.js';
import ClientRepository from './repositories/database/ClientRepository.js';
import RateLimitCache from './repositories/cache/RateLimitCache.js';
import RateLimitService from './services/RateLimitService.js';
import AuthService from './services/AuthService.js';
import GovernmentRepository from './repositories/database/GovernmentRepository.js';
import SpecializationRepository from './repositories/database/SpecializationRepository.js';
import ClientService from './services/ClientService.js';
import WorkerService from './services/WorkerService.js';
import ConversationRepository from './repositories/database/ConversationRepository.js';
import MessageRepository from './repositories/database/MessageRepository.js';
import ChatPresenceCache from './repositories/cache/ChatPresenceCache.js';
import ChatService from './services/ChatService.js';
import prisma from './libs/database.js';
import redisClient from './libs/redis.js';
// state.js  (wire it up like your other repos)

export const rateLimitCache = new RateLimitCache(/** @type {any} */ (redisClient));
export const otpCache = new OTPCache(/** @type {any} */ (redisClient));

export const sessionRepository = new SessionRepository(prisma);
export const userRepository = new UserRepository(prisma);
export const workerRepository = new WorkerRepository(prisma);
export const clientRepository = new ClientRepository(prisma);
export const specializationRepository = new SpecializationRepository(prisma);
export const governmentRepository = new GovernmentRepository(prisma);
export const conversationRepository = new ConversationRepository(prisma);
export const messageRepository = new MessageRepository(prisma);
export const chatPresenceCache = new ChatPresenceCache();

export const rateLimitService = new RateLimitService({ rateLimitCache });
export const userService = new UserService({ userRepository, workerRepository, clientRepository });
export const clientService = new ClientService({ userRepository, clientRepository });
export const workerService = new WorkerService({ workerRepository });
export const authService = new AuthService({ userRepository, workerRepository, clientRepository, governmentRepository, otpCache, sessionRepository, rateLimitCache });
export const chatService = new ChatService({
  conversationRepository,
  messageRepository,
  workerRepository,
  clientRepository,
  presence: chatPresenceCache,
});
