/**
 * Factory functions for creating typed mock objects.
 * Each mock mirrors its interface, with all methods as vi.fn().
 */
import { vi } from 'vitest';
import type IUserRepository from '../../src/repositories/interfaces/UserRepository.js';
import type IWorkerProfileRepository from '../../src/repositories/interfaces/WorkerRepository.js';
import type IClientProfileRepository from '../../src/repositories/interfaces/ClientRepository.js';
import type IGovernmentRepository from '../../src/repositories/interfaces/GovernmentRepository.js';
import type ISpecializationRepository from '../../src/repositories/interfaces/SpecializationRepository.js';
import type ISessionRepository from '../../src/repositories/interfaces/SessionRepository.js';
import type IConversationRepository from '../../src/repositories/interfaces/ConversationRepository.js';
import type IMessageRepository from '../../src/repositories/interfaces/MessageRepository.js';
import type IRateLimitCache from '../../src/cache/interfaces/RateLimitCache.js';
import type IOtpCache from '../../src/cache/interfaces/otpCache.js';
import type IChatPresenceCache from '../../src/cache/interfaces/ChatPresenceCache.js';

// ─── Repository Mocks ─────────────────────────────────────────────────────────

export const createMockUserRepository = (): {
  [K in keyof IUserRepository]: ReturnType<typeof vi.fn>;
} => ({
  exists: vi.fn(),
  find: vi.fn(),
  findMany: vi.fn(),
  findOnline: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

export const createMockWorkerProfileRepository = (): {
  [K in keyof IWorkerProfileRepository]: ReturnType<typeof vi.fn>;
} => ({
  exists: vi.fn(),
  find: vi.fn(),
  findOnline: vi.fn(),
  findWorkGovernments: vi.fn(),
  findVerification: vi.fn(),
  findSpecializations: vi.fn(),
  create: vi.fn(),
  insertWorkGovernments: vi.fn(),
  insertSpecializations: vi.fn(),
  insertSubSpecializations: vi.fn(),
  setVerification: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteAllWorkGovernments: vi.fn(),
  deleteWorkGovernments: vi.fn(),
  deleteSpecializations: vi.fn(),
  deleteAllSpecializations: vi.fn(),
  deleteSubSpecializations: vi.fn(),
});

export const createMockClientProfileRepository = (): {
  [K in keyof IClientProfileRepository]: ReturnType<typeof vi.fn>;
} => ({
  find: vi.fn(),
  findWithPrimaryLocation: vi.fn(),
  exists: vi.fn(),
  create: vi.fn(),
  createWithPrimaryLocation: vi.fn(),
  update: vi.fn(),
  updateWithPrimaryLocation: vi.fn(),
  delete: vi.fn(),
});

export const createMockGovernmentRepository = (): {
  [K in keyof IGovernmentRepository]: ReturnType<typeof vi.fn>;
} => ({
  find: vi.fn(),
  findMany: vi.fn(),
  findCity: vi.fn(),
  findCities: vi.fn(),
  create: vi.fn(),
  createCity: vi.fn(),
  update: vi.fn(),
  updateCity: vi.fn(),
  delete: vi.fn(),
  deleteCity: vi.fn(),
});

export const createMockSpecializationRepository = (): {
  [K in keyof ISpecializationRepository]: ReturnType<typeof vi.fn>;
} => ({
  find: vi.fn(),
  findMany: vi.fn(),
  findSubSpecialization: vi.fn(),
  findSubSpecializations: vi.fn(),
  create: vi.fn(),
  createSubSpecialization: vi.fn(),
  update: vi.fn(),
  updateSubSpecialization: vi.fn(),
  delete: vi.fn(),
  deleteSubSpecialization: vi.fn(),
});

export const createMockSessionRepository = (): {
  [K in keyof ISessionRepository]: ReturnType<typeof vi.fn>;
} => ({
  find: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

export const createMockConversationRepository = (): {
  [K in keyof IConversationRepository]: ReturnType<typeof vi.fn>;
} => ({
  find: vi.fn(),
  findByPair: vi.fn(),
  findMany: vi.fn(),
  findNonEmptyConversationsWithParticipantsAndMessages: vi.fn(),
  findParticipant: vi.fn(),
  createWithParticipants: vi.fn(),
  update: vi.fn(),
  updateLastRead: vi.fn(),
  updateLastReceived: vi.fn(),
  delete: vi.fn(),
});

export const createMockMessageRepository = (): {
  [K in keyof IMessageRepository]: ReturnType<typeof vi.fn>;
} => ({
  findById: vi.fn(),
  findPage: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
});

// ─── Cache Mocks ──────────────────────────────────────────────────────────────

export const createMockRateLimitCache = (): {
  [K in keyof IRateLimitCache]: ReturnType<typeof vi.fn>;
} => ({
  isSendOnCooldown: vi.fn(),
  isDeviceOnCooldown: vi.fn(),
  getSendCooldownTTL: vi.fn(),
  incrementSend: vi.fn(),
  getVerifyAttempts: vi.fn(),
  incrementVerify: vi.fn(),
  resetVerifyAttempts: vi.fn(),
  setVerified: vi.fn(),
  isVerified: vi.fn(),
  deleteVerified: vi.fn(),
  incrementAccounts: vi.fn(),
  getAccountsAttempts: vi.fn(),
  resetAfterSuccess: vi.fn(),
});

export const createMockOtpCache = (): {
  [K in keyof IOtpCache]: ReturnType<typeof vi.fn>;
} => ({
  setOtp: vi.fn(),
  getOtp: vi.fn(),
  otpExists: vi.fn(),
  deleteOtp: vi.fn(),
});

export const createMockChatPresenceCache = (): {
  [K in keyof IChatPresenceCache]: ReturnType<typeof vi.fn>;
} => ({
  addSocket: vi.fn(),
  removeSocket: vi.fn(),
  countSockets: vi.fn(),
  isOnline: vi.fn(),
  refreshPresence: vi.fn(),
  removeAllSockets: vi.fn(),
  enterChat: vi.fn(),
  leaveChat: vi.fn(),
  isInChat: vi.fn(),
  leaveAllChats: vi.fn(),
  removeAllInChat: vi.fn(),
  setTyping: vi.fn(),
  clearTyping: vi.fn(),
});

// ─── Domain factories ─────────────────────────────────────────────────────────

export const makeUser = (overrides: Partial<any> = {}) => ({
  id: 'user-1',
  phoneNumber: '01012345678',
  firstName: 'Ahmed',
  middleName: 'Mohamed',
  lastName: 'Hassan',
  profileImageUrl: 'https://cdn.motqen.com/profile.jpg',
  status: 'ACTIVE' as const,
  role: 'USER' as const,
  isOnline: false,
  isClient: false,
  isWorker: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeWorkerProfile = (overrides: Partial<any> = {}) => ({
  id: 'worker-profile-1',
  userId: 'user-1',
  experienceYears: 5,
  isInTeam: false,
  acceptsUrgentJobs: true,
  isAvailable: true,
  rating: 4.5,
  completedJobs: 10,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeClientProfile = (overrides: Partial<any> = {}) => ({
  id: 'client-profile-1',
  userId: 'user-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeConversation = (overrides: Partial<any> = {}) => ({
  id: 'conv-1',
  messageCounter: 5,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeParticipant = (overrides: Partial<any> = {}) => ({
  id: 'participant-1',
  conversationId: 'conv-1',
  userId: 'user-1',
  role: 'CLIENT' as const,
  lastReadMessageNumber: 3,
  lastReceivedMessageNumber: 5,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeMessage = (overrides: Partial<any> = {}) => ({
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'user-1',
  messageNumber: 1,
  content: 'Hello',
  type: 'TEXT',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeSession = (overrides: Partial<any> = {}) => ({
  id: 'session-1',
  userId: 'user-1',
  token: 'hashed-token',
  isRevoked: false,
  deviceId: 'device-1',
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  lastUsedAt: new Date('2025-01-01'),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeGovernment = (overrides: Partial<any> = {}) => ({
  id: 'gov-1',
  name: 'Cairo',
  nameAr: 'القاهرة',
  long: 31.2357,
  lat: 30.0444,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const makeSpecialization = (overrides: Partial<any> = {}) => ({
  id: 'spec-1',
  name: 'Electricity',
  nameAr: 'كهرباء',
  category: 'ELECTRICITY' as const,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});
