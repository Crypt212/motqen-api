/**
 * Admin panel routes for MOTQEN-Dashboard (no changes to dashboard.ts /me router).
 * Mounted at `/` on v1 router — paths match dashboard mock: /dashboard/*, /craftsmen, …
 */
import { Router } from 'express';
import type { Response } from 'express';
import { asyncHandler } from '../../../types/asyncHandler.js';
import { authenticateAccess, authorizeAdmin, isActive } from '../../../middlewares/authMiddleware.js';
import SuccessResponse from '../../../responses/successResponse.js';
import prisma from '../../../libs/database.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import AppError from '../../../errors/AppError.js';
import { workerProfileRepository, userRepository, orderController } from '../../../state.js';
import { validateBody } from '../../../middlewares/validateRequest.js';
import { z } from '../../../libs/zod.js';

/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma payloads with deep includes for admin detail */
const router = Router();

router.use(authenticateAccess, isActive, authorizeAdmin);

function sendPaginatedSuccess(
  res: Response,
  message: string,
  data: unknown[],
  total: number,
  page: number,
  pageSize: number
): Response {
  return new SuccessResponse(message, { data, meta: { total, page, pageSize } }, 200).send(res);
}

function parsePagination(q: Record<string, unknown>): { page: number; pageSize: number; skip: number } {
  const page = Math.max(1, parseInt(String(q.page ?? '1'), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(q.pageSize ?? '20'), 10) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// ─── Dashboard KPI ─────────────────────────────────────────────────────────

router.get(
  '/dashboard/stats',
  asyncHandler(async (_req, res) => {
    const [pendingApprovals, activeOrders, openDisputes, totalUsers] = await Promise.all([
      prisma.workerVerification.count({ where: { status: 'PENDING' } }),
      prisma.order.count({
        where: { orderStatus: { notIn: ['COMPLETED', 'CANCELLED'] } },
      }),
      Promise.resolve(0),
      prisma.user.count(),
    ]);

    new SuccessResponse('Stats', { pendingApprovals, activeOrders, openDisputes, totalUsers }, 200).send(res);
  })
);

router.get(
  '/dashboard/recent-events',
  asyncHandler(async (_req, res) => {
    const latestPending = await prisma.workerProfile.findFirst({
      where: { verification: { status: 'PENDING' } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        verification: true,
        chosenSpecializations: { take: 1, include: { subSpecialization: true, specialization: true } },
      },
    });

    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { subSpecialization: true },
    });

    new SuccessResponse(
      'Recent events',
      {
        latestPendingCraftsman: latestPending
          ? {
              id: latestPending.userId,
              fullName: [latestPending.user.firstName, latestPending.user.middleName, latestPending.user.lastName]
                .filter(Boolean)
                .join(' ')
                .trim(),
              specialty:
                latestPending.chosenSpecializations[0]?.subSpecialization?.nameAr ||
                latestPending.chosenSpecializations[0]?.specialization?.nameAr ||
                '—',
              registeredAt: latestPending.createdAt.toISOString(),
            }
          : null,
        latestOrder: latestOrder
          ? {
              id: latestOrder.id,
              serviceType: latestOrder.title,
              status: latestOrder.orderStatus,
              createdAt: latestOrder.createdAt.toISOString(),
            }
          : null,
        latestDispute: null,
      },
      200
    ).send(res);
  })
);

// ─── Craftsmen (admin) ─────────────────────────────────────────────────────

function craftsmanStatusFromRow(userStatus: string, verificationStatus: string | undefined): string {
  if (userStatus === 'BANNED') return 'BANNED';
  if (userStatus === 'SUSPENDED') return 'SUSPENDED';
  if (verificationStatus === 'APPROVED') return 'APPROVED';
  if (verificationStatus === 'REJECTED') return 'REJECTED';
  return 'PENDING';
}

router.get(
  '/craftsmen',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = parsePagination(req.query as Record<string, unknown>);
    const statusFilter = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;

    const where: Prisma.WorkerProfileWhereInput = {};

    if (statusFilter === 'PENDING') {
      where.OR = [{ verification: { status: 'PENDING' } }, { verification: { is: null } }];
    } else if (statusFilter === 'APPROVED') {
      where.AND = [{ user: { status: 'ACTIVE' } }, { verification: { status: 'APPROVED' } }];
    } else if (statusFilter === 'REJECTED') {
      where.verification = { status: 'REJECTED' };
    } else if (statusFilter === 'SUSPENDED') {
      where.user = { status: 'SUSPENDED' };
    } else if (statusFilter === 'BANNED') {
      where.user = { status: 'BANNED' };
    }

    const [total, rows] = await Promise.all([
      prisma.workerProfile.count({ where }),
      prisma.workerProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { include: { locations: { where: { isMain: true }, take: 1, include: { government: true, city: true } } } },
          verification: true,
          chosenSpecializations: { take: 1, include: { subSpecialization: true, specialization: true } },
        },
      }),
    ]);

    const data = rows.map((wp) => {
      const loc = wp.user.locations[0];
      const area = loc ? `${loc.government?.name ?? ''} — ${loc.city?.name ?? ''}`.trim() : '—';
      const spec =
        wp.chosenSpecializations[0]?.subSpecialization?.nameAr ||
        wp.chosenSpecializations[0]?.specialization?.nameAr ||
        '—';
      const fullName = [wp.user.firstName, wp.user.middleName, wp.user.lastName].filter(Boolean).join(' ').trim();
      return {
        id: wp.userId,
        fullName,
        primarySpecialty: spec,
        area,
        registeredAt: wp.createdAt.toISOString(),
        status: craftsmanStatusFromRow(wp.user.status, wp.verification?.status),
      };
    });

    new SuccessResponse('Craftsmen', { data, meta: { total, page, pageSize } }, 200).send(res);
  })
);

router.get(
  '/craftsmen/:id',
  asyncHandler(async (req, res) => {
    const userId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const wp = (await prisma.workerProfile.findFirst({
      where: { userId },
      include: {
        user: { include: { locations: { where: { isMain: true }, take: 1, include: { government: true, city: true } } } },
        verification: true,
        portfolio: { include: { projectImages: true } },
        chosenSpecializations: { include: { subSpecialization: true, specialization: true } },
        workingHours: true,
        workGovernments: true,
      },
    })) as any;
    if (!wp) throw new AppError('Craftsman not found', 404);

    const u = wp.user;
    const loc = u.locations[0];
    const subs = wp.chosenSpecializations.map((c) => c.subSpecialization.nameAr);
    const primary = subs[0] || wp.chosenSpecializations[0]?.specialization.nameAr || '—';

    const body = {
      id: u.id,
      fullName: [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ').trim(),
      profilePhoto: u.profileImageUrl ?? '',
      phoneNumber: u.phoneNumber,
      governorate: loc?.government?.name ?? '',
      district: loc?.city?.name ?? '',
      neighborhood: loc?.address ?? '',
      primarySpecialty: primary,
      subSpecialties: subs,
      experienceYears: wp.experienceYears,
      isInTeam: wp.isInTeam,
      workingHours: wp.workingHours
        ? {
            daysOfWeek: [...wp.workingHours.daysOfWeek],
            startTime: wp.workingHours.startTime,
            endTime: wp.workingHours.endTime,
          }
        : { daysOfWeek: [] as string[], startTime: '', endTime: '' },
      serviceAreas: wp.workGovernments.map((g) => g.name),
      acceptsUrgentJobs: wp.acceptsUrgentJobs,
      status: craftsmanStatusFromRow(u.status, wp.verification?.status),
      registeredAt: wp.createdAt.toISOString(),
      reviewedAt: null as string | null,
      rejectionReason: wp.verification?.status === 'REJECTED' ? wp.verification.reason ?? null : null,
      termsAccepted: {
        noExternalDeals: true,
        cancellationPolicy: true,
        ratingAccepted: true,
        acceptedAt: wp.createdAt.toISOString(),
      },
      verification: {
        idWithPersonalImageUrl: wp.verification?.idWithPersonalImageUrl ?? '',
        idDocumentUrl: wp.verification?.idDocumentUrl ?? '',
        status: wp.verification?.status ?? 'PENDING',
        reason: wp.verification?.reason,
      },
      portfolio: (wp.portfolio?.projectImages ?? []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        caption: null as string | null,
        uploadedAt: img.createdAt.toISOString(),
        adminApproved: true,
      })),
    };

    new SuccessResponse('Craftsman', body, 200).send(res);
  })
);

const rejectBodySchema = z.object({ reason: z.string().optional().nullable() });

router.post(
  '/craftsmen/:id/approve',
  asyncHandler(async (req, res) => {
    const userId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const wp = (await prisma.workerProfile.findFirst({
      where: { userId },
      include: { verification: true },
    })) as any;
    if (!wp) throw new AppError('Craftsman not found', 404);
    if (!wp.verification) throw new AppError('Verification record missing', 400);
    await workerProfileRepository.setVerification({
      workerProfileId: wp.id,
      verification: {
        idWithPersonalImageUrl: wp.verification.idWithPersonalImageUrl,
        idDocumentUrl: wp.verification.idDocumentUrl,
        status: 'APPROVED',
        reason: 'Approved by admin',
      },
    });
    new SuccessResponse('تم قبول الحرفي بنجاح', { message: 'تم قبول الحرفي بنجاح' }, 200).send(res);
  })
);

router.post(
  '/craftsmen/:id/reject',
  validateBody(rejectBodySchema),
  asyncHandler(async (req, res) => {
    const userId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const wp = (await prisma.workerProfile.findFirst({
      where: { userId },
      include: { verification: true },
    })) as any;
    if (!wp) throw new AppError('Craftsman not found', 404);
    if (!wp.verification) throw new AppError('Verification record missing', 400);
    const reason = (req.body as { reason?: string | null }).reason ?? 'Rejected';
    await workerProfileRepository.setVerification({
      workerProfileId: wp.id,
      verification: {
        idWithPersonalImageUrl: wp.verification.idWithPersonalImageUrl,
        idDocumentUrl: wp.verification.idDocumentUrl,
        status: 'REJECTED',
        reason,
      },
    });
    new SuccessResponse('Rejected', { message: 'تم رفض الحرفي' }, 200).send(res);
  })
);

router.post(
  '/craftsmen/:id/suspend',
  asyncHandler(async (req, res) => {
    const userId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const wp = await prisma.workerProfile.findFirst({ where: { userId } });
    if (!wp) throw new AppError('Craftsman not found', 404);
    await userRepository.update({ filter: { id: userId }, user: { status: 'SUSPENDED' } });
    new SuccessResponse('Suspended', { message: 'تم إيقاف الحرفي مؤقتاً' }, 200).send(res);
  })
);

router.post(
  '/craftsmen/:craftsmanId/portfolio/:imageId/approve',
  asyncHandler(async (_req, res) => {
    new SuccessResponse('Portfolio image', { message: 'تم قبول الصورة' }, 200).send(res);
  })
);

// ─── Orders (admin) ───────────────────────────────────────────────────────
router.get('/orders', orderController.list);
router.get('/orders/:orderId', orderController.getById);
router.get('/orders/:orderId/location', orderController.getLocation);

// ─── Stubs: disputes / users ───────────────────────────────────────────────

router.get('/disputes', asyncHandler(async (req, res) => {
  const { page, pageSize } = parsePagination(req.query as Record<string, unknown>);
  sendPaginatedSuccess(res, 'Disputes', [], 0, page, pageSize);
}));

router.get('/disputes/:id', asyncHandler(async () => {
  throw new AppError('Dispute not found', 404);
}));

router.get('/users', asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query as Record<string, unknown>);

  const roleFilter = typeof req.query.role === 'string' ? (req.query.role as string).toUpperCase() : undefined;
  const where: Prisma.UserWhereInput = {};
  if (roleFilter) where.role = roleFilter as any;

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
  ]);

  const data = rows.map((u) => ({
    id: u.id,
    phoneNumber: u.phoneNumber,
    fullName: [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ').trim(),
    status: u.status,
    role: u.role,
    registeredAt: u.createdAt.toISOString(),
  }));

  sendPaginatedSuccess(res, 'Users', data, total, page, pageSize);
}));

router.get('/users/:id/orders', asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query as Record<string, unknown>);
  const userId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

  const client = await prisma.clientProfile.findFirst({ where: { userId } });
  if (!client) {
    sendPaginatedSuccess(res, 'User orders', [], 0, page, pageSize);
    return;
  }

  const [total, rows] = await Promise.all([
    prisma.order.count({ where: { clientProfileId: client.id } }),
    prisma.order.findMany({ where: { clientProfileId: client.id }, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
  ]);

  const data = rows.map((o) => ({ id: o.id, title: o.title, orderStatus: o.orderStatus, workStatus: o.workStatus, createdAt: o.createdAt.toISOString() }));
  sendPaginatedSuccess(res, 'User orders', data, total, page, pageSize);
}));

// ─── Stubs: finance (GET) ────────────────────────────────────────────────────

const financeList = asyncHandler(async (req, res) => {
  const { page, pageSize } = parsePagination(req.query as Record<string, unknown>);
  sendPaginatedSuccess(res, 'Finance', [], 0, page, pageSize);
});

router.get('/finance/payments', financeList);
router.get('/finance/escrow', financeList);
router.get('/finance/ledger', financeList);
router.get('/finance/worker-balances', financeList);
router.get('/finance/withdrawals', financeList);
router.get('/finance/payouts', financeList);
router.get('/finance/refunds', financeList);
router.get('/finance/worker-debts', financeList);
router.get('/finance/audit-log', financeList);
router.get('/finance/fee-rules', financeList);

router.get(
  '/finance/payments/:id',
  asyncHandler(async () => {
    throw new AppError('Not found', 404);
  })
);
router.get(
  '/finance/worker-balances/:id',
  asyncHandler(async () => {
    throw new AppError('Not found', 404);
  })
);
router.get(
  '/finance/withdrawals/:id',
  asyncHandler(async () => {
    throw new AppError('Not found', 404);
  })
);
router.get(
  '/finance/payouts/:id',
  asyncHandler(async () => {
    throw new AppError('Not found', 404);
  })
);
router.get(
  '/finance/refunds/:id',
  asyncHandler(async () => {
    throw new AppError('Not found', 404);
  })
);

router.get(
  '/finance/fee-rules/active',
  asyncHandler(async (_req, res) => {
    new SuccessResponse(
      'Fee rule',
      {
        id: 'stub-fee-rule',
        platformFeePercent: 0.1,
        description: 'Stub (finance not migrated)',
        effectiveFrom: new Date().toISOString(),
        isActive: true,
      },
      200
    ).send(res);
  })
);

router.get(
  '/finance/summary',
  asyncHandler(async (_req, res) => {
    new SuccessResponse(
      'Summary',
      {
        totalCollectedThisMonth: 0,
        platformRevenueThisMonth: 0,
        workerPayoutsThisMonth: 0,
        pendingEscrowTotal: 0,
        pendingWithdrawalsCount: 0,
        pendingWithdrawalsTotal: 0,
        outstandingDebtsTotal: 0,
        currency: 'EGP',
      },
      200
    ).send(res);
  })
);

export default router;
