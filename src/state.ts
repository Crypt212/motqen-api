import UserService from './services/UserService.js';
import OTPCache from './cache/redis/OTPCache.js';
import SessionRepository from './repositories/prisma/SessionRepository.js';
import UserRepository from './repositories/prisma/UserRepository.js';
import WorkerProfileRepository from './repositories/prisma/WorkerRepository.js';
import ClientProfileRepository from './repositories/prisma/ClientRepository.js';
import RateLimitCache from './cache/redis/RateLimitCache.js';
import TokenCache from './cache/redis/TokenCache.js';
import RateLimitService from './services/RateLimitService.js';
import AuthService from './services/AuthService.js';
import GovernmentRepository from './repositories/prisma/GovernmentRepository.js';
import GovernmentService from './services/GovernmentService.js';
import GovernmentController from './controllers/GovernmentController.js';
import SpecializationRepository from './repositories/prisma/SpecializationRepository.js';
import SpecializationService from './services/SpecializationService.js';
import ClientProfileService from './services/ClientProfileService.js';
import WorkerProfileService from './services/WorkerProfileService.js';
import ConversationRepository from './repositories/prisma/ConversationRepository.js';
import MessageRepository from './repositories/prisma/MessageRepository.js';
import FlaggedMessageRepository from './repositories/prisma/FlaggedMessageRepository.js';
import ChatPresenceCache from './cache/redis/ChatPresenceCache.js';
import ChatService from './services/ChatService.js';
import ContactDetectionService from './services/ContactDetectionService.js';
import PresenceService from './services/PresenceService.js';
import prisma from './libs/database.js';
import redisClient from './libs/redis.js';
import { TransactionManager } from './repositories/prisma/TransactionManager.js';

export const rateLimitCache = new RateLimitCache(redisClient);
export const otpCache = new OTPCache(redisClient);
export const chatPresenceCache = new ChatPresenceCache(redisClient);
export const tokenCache = new TokenCache(redisClient);

export const sessionRepository = new SessionRepository(prisma);
export const userRepository = new UserRepository(prisma);
export const workerProfileRepository = new WorkerProfileRepository(prisma);
export const clientProfileRepository = new ClientProfileRepository(prisma);
export const specializationRepository = new SpecializationRepository(prisma);
export const specializationService = new SpecializationService({ specializationRepository });
export const governmentRepository = new GovernmentRepository(prisma);
export const governmentService = new GovernmentService({ governmentRepository });
export const governmentController = new GovernmentController({
  governmentService,
});
export const conversationRepository = new ConversationRepository(prisma);
export const messageRepository = new MessageRepository(prisma);
export const flaggedMessageRepository = new FlaggedMessageRepository(prisma);

export const transactionManager = new TransactionManager(prisma);

export const rateLimitService = new RateLimitService({ rateLimitCache });
export const userService = new UserService({
  userRepository,
  workerProfileRepository,
  clientProfileRepository,
});
export const clientProfileService = new ClientProfileService({
  userRepository,
  clientProfileRepository,
});
export const workerProfileService = new WorkerProfileService({
  userRepository,
  workerProfileRepository,
});
export const authService = new AuthService({
  userRepository,
  workerProfileRepository,
  clientProfileRepository,
  governmentRepository,
  otpCache,
  sessionRepository,
  rateLimitCache,
  tokenCache,
});
export const chatService = new ChatService({
  conversationRepository,
  messageRepository,
  workerProfileRepository,
  clientProfileRepository,
  presence: chatPresenceCache,
});
export const contactDetectionService = new ContactDetectionService(flaggedMessageRepository);
export const presenceService = new PresenceService({
  presenceCache: chatPresenceCache,
  conversationRepository,
  prisma,
});
