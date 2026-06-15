import UserService from './services/UserService.js';
import OTPCache from './cache/redis/OTPCache.js';
import DataCache from './cache/redis/DataCache.js';
import SessionRepository from './repositories/prisma/SessionRepository.js';
import AdminRepository from './repositories/prisma/AdminRepository.js';
import AdminSessionRepository from './repositories/prisma/AdminSessionRepository.js';
import AdminAuditLogRepository from './repositories/prisma/AdminAuditLogRepository.js';
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
import AdminAuthService from './services/AdminAuthService.js';
import AdminAuditLogService from './services/AdminAuditLogService.js';
import AdminUsersService from './services/AdminUsersService.js';
import AdminPlatformUsersService from './services/AdminPlatformUsersService.js';
import AdminIssuesService from './services/AdminIssuesService.js';
import AdminIssuesController from './controllers/AdminIssuesController.js';
import AdminVerificationsController from './controllers/AdminVerificationsController.js';
import AdminReportsController from './controllers/AdminReportsController.js';
import AdminUsersController from './controllers/AdminUsersController.js';
import AdminWorkersController from './controllers/AdminWorkersController.js';
import MessageRepository from './repositories/prisma/MessageRepository.js';
import FlaggedMessageRepository from './repositories/prisma/FlaggedMessageRepository.js';
import ChatPresenceCache from './cache/redis/ChatPresenceCache.js';
import ChatService from './services/ChatService.js';
import ContactDetectionService from './services/ContactDetectionService.js';
import PresenceService from './services/PresenceService.js';
import prisma from './libs/database.js';
import redisClient from './libs/redis.js';
import { TransactionManager } from './repositories/prisma/TransactionManager.js';
import LocationRepository from './repositories/prisma/LocationRepository.js';
import OrderRepository from './repositories/prisma/OrderRepository.js';
import WorkerOccupiedTimeSlotRepository from './repositories/prisma/WorkerOccupiedTimeSlotRepository.js';
import OrderService from './services/OrderService.js';
import OrderController from './controllers/OrderController.js';
import LocationService from './services/LocationService.js';
import LocationController from './controllers/LocationController.js';
import NegotiationService from './services/NegotiationService.js';
import NegotiationRepository from './repositories/prisma/NegotiationRepository.js';
import NotificationRepository from './repositories/prisma/NotificationRepository.js';
import NotificationService from './services/NotificationService.js';
import { FirebaseProvider } from './providers/FirebaseProvider.js';
import ReportRepository from './repositories/prisma/ReportRepository.js';
import ReportService from './services/ReportService.js';
import ReportController from './controllers/ReportController.js';
import ProposalRepository from './repositories/prisma/ProposalRepository.js';
import ProposalService from './services/ProposalService.js';
import ProposalController from './controllers/ProposalController.js';

export const rateLimitCache = new RateLimitCache(redisClient);
export const otpCache = new OTPCache(redisClient);
export const chatPresenceCache = new ChatPresenceCache(redisClient);
export const tokenCache = new TokenCache(redisClient);
export const dataCache = new DataCache(redisClient);

export const sessionRepository = new SessionRepository(prisma);
export const userRepository = new UserRepository(prisma);
export const workerProfileRepository = new WorkerProfileRepository(prisma);
export const clientProfileRepository = new ClientProfileRepository(prisma);
export const specializationRepository = new SpecializationRepository(prisma);
export const specializationService = new SpecializationService({
  specializationRepository,
  dataCache,
});
export const governmentRepository = new GovernmentRepository(prisma);
export const governmentService = new GovernmentService({ governmentRepository, dataCache });
export const governmentController = new GovernmentController({
  governmentService,
});
export const transactionManager = new TransactionManager(prisma);

export const locationRepository = new LocationRepository(prisma);
export const locationService = new LocationService({
  locationRepository,
  governmentRepository,
  transactionManager,
});
export const locationController = new LocationController({ locationService });
export const conversationRepository = new ConversationRepository(prisma);
export const messageRepository = new MessageRepository(prisma);
export const flaggedMessageRepository = new FlaggedMessageRepository(prisma);
export const negotiationRepository = new NegotiationRepository(prisma);

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
  dataCache,
});
export const authService = new AuthService({
  userRepository,
  workerProfileRepository,
  otpCache,
  sessionRepository,
  rateLimitCache,
  tokenCache,
  transactionManager,
});
export const adminRepository = new AdminRepository(prisma);
export const adminSessionRepository = new AdminSessionRepository(prisma);
export const adminAuditLogRepository = new AdminAuditLogRepository(prisma);
export const adminAuthService = new AdminAuthService(adminRepository, adminSessionRepository);
export const adminAuditLogService = new AdminAuditLogService(adminAuditLogRepository);
export const adminUsersService = new AdminUsersService(adminRepository);
export const adminPlatformUsersService = new AdminPlatformUsersService();
export const adminUsersController = new AdminUsersController();
export const adminIssuesService = new AdminIssuesService();
export const adminIssuesController = new AdminIssuesController();
export const adminVerificationsController = new AdminVerificationsController();
export const adminReportsController = new AdminReportsController();
export const adminWorkersController = new AdminWorkersController();
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

export const orderRepository = new OrderRepository(prisma);
export const workerOccupiedTimeSlotRepository = new WorkerOccupiedTimeSlotRepository(prisma);
export const proposalRepository = new ProposalRepository(prisma);

export const orderService = new OrderService({
  orderRepository,
  workerProfileRepository,
  locationRepository,
  transactionManager,
});

export const proposalService = new ProposalService({
  proposalRepository,
  orderRepository,
  workerProfileRepository,
  transactionManager,
});

export const proposalController = new ProposalController({ proposalService });

export const negotiationService = new NegotiationService({
  negotiationRepository,
  proposalRepository,
  workerOccupiedTimeSlotRepository,
  transactionManager,
});

export const orderController = new OrderController({ orderService, locationService });

export const notificationRepository = new NotificationRepository(prisma);
export const firebaseProvider = new FirebaseProvider();
export const notificationService = new NotificationService(
  notificationRepository,
  redisClient,
  sessionRepository,
  userRepository,
  firebaseProvider,
  workerProfileRepository
);
export const webhookEventRepository = new WebhookEventRepository(prisma);
export const paymentRepository = new PaymentRepository(prisma);
export const paymentAttemptRepository = new PaymentAttemptRepository(prisma);
export const escrowHoldRepository = new EscrowHoldRepository(prisma);
export const transactionLogRepository = new TransactionLogRepository(prisma);
export const activityLogRepository = new ActivityLogRepository(prisma);
export const feeRuleRepository = new FeeRuleRepository(prisma);
export const workerBalanceRepository = new WorkerBalanceRepository(prisma);
export const refundRepository = new RefundRepository(prisma);
export const workerDebtRepository = new WorkerDebtRepository(prisma);
export const disputeRepository = new DisputeRepository(prisma);
export const withdrawRequestRepository = new WithdrawRequestRepository(prisma);
export const payoutMethodRepository = new PayoutMethodRepository(prisma);
export const payoutExecutionRepository = new PayoutExecutionRepository(prisma);

export const paymobProvider = new PaymobProvider();

export const paymentService = new PaymentService(
  webhookEventRepository,
  paymentRepository,
  paymentAttemptRepository,
  escrowHoldRepository,
  transactionLogRepository,
  feeRuleRepository,
  workerBalanceRepository,
  paymobProvider,
  prisma
);

export const webhookController = new WebhookController(paymentService, paymobProvider);

import { PaymentController } from './controllers/financial/PaymentController.js';
import { WebhookEventRepository } from './repositories/prisma/financial/WebhookEventRepository.js';
import { PaymentRepository } from './repositories/prisma/financial/PaymentRepository.js';
import { PaymentAttemptRepository } from './repositories/prisma/financial/PaymentAttemptRepository.js';
import EscrowHoldRepository from './repositories/prisma/financial/EscrowHoldRepository.js';
import TransactionLogRepository from './repositories/prisma/financial/TransactionLogRepository.js';
import ActivityLogRepository from './repositories/prisma/financial/ActivityLogRepository.js';
import FeeRuleRepository from './repositories/prisma/financial/FeeRuleRepository.js';
import WorkerBalanceRepository from './repositories/prisma/financial/WorkerBalanceRepository.js';
import { RefundRepository } from './repositories/prisma/financial/RefundRepository.js';
import { WorkerDebtRepository } from './repositories/prisma/financial/WorkerDebtRepository.js';
import DisputeRepository from './repositories/prisma/financial/DisputeRepository.js';
import { WithdrawRequestRepository } from './repositories/prisma/financial/WithdrawRequestRepository.js';
import { PayoutMethodRepository } from './repositories/prisma/financial/PayoutMethodRepository.js';
import { PayoutExecutionRepository } from './repositories/prisma/financial/PayoutExecutionRepository.js';
import { PaymobProvider } from './providers/PaymobProvider.js';
import { PaymentService } from './services/financial/PaymentService.js';
import { WebhookController } from './controllers/WebhookController.js';
import { EscrowService } from './services/financial/EscrowService.js';
import { EscrowController } from './controllers/financial/EscrowController.js';
import { EscrowReleaseOrchestratorService } from './services/financial/EscrowReleaseOrchestratorService.js';
import { WithdrawalService } from './services/financial/WithdrawalService.js';
import { WorkerEarningsController } from './controllers/financial/WorkerEarningsController.js';
import { WithdrawalAdminController } from './controllers/financial/WithdrawalAdminController.js';
import { RefundService } from './services/financial/RefundService.js';
import { RefundController } from './controllers/financial/RefundController.js';
import { DashboardService } from './services/financial/DashboardService.js';
import { AdminDashboardController } from './controllers/financial/AdminDashboardController.js';
import { DisputeService } from './services/financial/DisputeService.js';
import { DisputeController } from './controllers/financial/DisputeController.js';
import { FinancialDashboardRepository } from './repositories/prisma/financial/FinancialDashboardRepository.js';
export const paymentController = new PaymentController(paymentService);

export const escrowService = new EscrowService(
  escrowHoldRepository,
  transactionLogRepository,
  workerBalanceRepository,
  workerDebtRepository,
  prisma
);

orderService.setEscrowService(escrowService);

export const escrowReleaseOrchestratorService = new EscrowReleaseOrchestratorService(
  escrowHoldRepository,
  escrowService
);

export const escrowController = new EscrowController(escrowService);

export const withdrawalService = new WithdrawalService(
  workerBalanceRepository,
  withdrawRequestRepository,
  payoutMethodRepository,
  payoutExecutionRepository,
  transactionLogRepository,
  workerDebtRepository,
  prisma
);

export const workerEarningsController = new WorkerEarningsController(withdrawalService);

export const withdrawalAdminController = new WithdrawalAdminController(withdrawalService);

export const refundService = new RefundService(
  refundRepository,
  escrowHoldRepository,
  transactionLogRepository,
  workerBalanceRepository,
  workerDebtRepository,
  paymobProvider,
  paymentRepository,
  prisma
);

export const refundController = new RefundController(refundService);

escrowService.setRefundService(refundService);

export const financialDashboardRepository = new FinancialDashboardRepository(prisma);
export const dashboardService = new DashboardService(financialDashboardRepository);
export const adminDashboardController = new AdminDashboardController(
  dashboardService,
  activityLogRepository
);

export const disputeService = new DisputeService(
  disputeRepository,
  transactionLogRepository,
  escrowService,
  prisma
);

export const disputeController = new DisputeController(disputeService);

import AdminCasesService from './services/AdminCasesService.js';
import AdminCasesController from './controllers/AdminCasesController.js';
import { AdminPlatformDashboardService } from './services/admin/AdminPlatformDashboardService.js';
import { AdminPlatformDashboardController } from './controllers/admin/AdminPlatformDashboardController.js';
import { AdminFinanceService } from './services/admin/AdminFinanceService.js';
import { AdminFinanceController } from './controllers/admin/AdminFinanceController.js';
import { AdminNotificationService } from './services/admin/AdminNotificationService.js';
import { AdminNotificationController } from './controllers/admin/AdminNotificationController.js';

export const adminCasesService = new AdminCasesService(
  adminIssuesService,
  withdrawalService,
  disputeService
);
export const adminCasesController = new AdminCasesController();

export const reportRepository = new ReportRepository(prisma);
export const reportService = new ReportService({ reportRepository });
export const reportController = new ReportController({ reportService });

export const adminPlatformDashboardService = new AdminPlatformDashboardService(prisma);
export const adminPlatformDashboardController = new AdminPlatformDashboardController(
  adminPlatformDashboardService
);

export const adminFinanceService = new AdminFinanceService(
  prisma,
  dashboardService,
  escrowService,
  withdrawalService,
  refundService,
  feeRuleRepository,
  activityLogRepository
);
export const adminFinanceController = new AdminFinanceController(adminFinanceService);

export const adminNotificationService = new AdminNotificationService(prisma, notificationService);
export const adminNotificationController = new AdminNotificationController(adminNotificationService);
