import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import prisma from '../libs/database.js';
import { userRepository, sessionRepository, adminAuditLogService } from '../state.js';
import {
  AdminWorkerQuerySchema,
  ManualWorkerCreateSchema,
  RejectWorkerSchema,
  SuspendWorkerSchema,
} from '../schemas/requests/admin-workers.request.js';
import { handlePagination } from '../utils/handleFilteration.js';
import { AdminRole, AdminAuditCategory, Prisma } from '../generated/prisma/client.js';

export default class AdminWorkersController {
  listWorkers = asyncHandler(async (req, res) => {
    const parsed = AdminWorkerQuerySchema.parse(req.query);
    const { page, limit, accountStatus, verificationStatus, government, specialization, search } =
      parsed;
    console.log(req.query);
    const where: Prisma.WorkerProfileWhereInput = {
      user: {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { middleName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(accountStatus && { status: accountStatus }),
        ...(government && {
          locations: {
            some: {
              governmentId: government,
            },
          },
        }),
      },
      ...(verificationStatus && {
        verification: {
          status: verificationStatus,
        },
      }),
      ...(specialization && {
        chosenSpecializations: {
          some: {
            specializationId: specialization,
          },
        },
      }),
    };

    const total = await prisma.workerProfile.count({ where });

    const { paginationResult, paginationQuery } = handlePagination({
      total,
      paginationOptions: { page, limit },
    });
    console.log(where);
    const workers = await prisma.workerProfile.findMany({
      where,
      include: {
        user: {
          include: {
            locations: {
              where: { isHidden: false },
              include: {
                government: true,
                city: true,
              },
            },
          },
        },
        verification: true,
        chosenSpecializations: {
          take: 1,
          include: {
            specialization: true,
          },
        },
      },
      skip: paginationQuery.skip,
      take: paginationQuery.take,
      orderBy: { createdAt: 'desc' },
    });

    const mappedWorkers = workers.map((worker) => {
      // Find main location or fallback to first active location
      const mainLocation = worker.user.locations.find((l) => l.isMain) || worker.user.locations[0];
      const primarySpecialization = worker.chosenSpecializations[0]?.specialization;

      return {
        workerProfileId: worker.id,
        userId: worker.userId,
        firstName: worker.user.firstName,
        middleName: worker.user.middleName,
        lastName: worker.user.lastName,
        phoneNumber: worker.user.phoneNumber,
        profileImageUrl: worker.user.profileImageUrl,
        accountStatus: worker.user.status,
        verificationStatus: worker.verification?.status || 'PENDING',
        specialization: primarySpecialization
          ? {
              id: primarySpecialization.id,
              name: primarySpecialization.name,
              nameAr: primarySpecialization.nameAr,
            }
          : null,
        government: mainLocation?.government
          ? {
              id: mainLocation.government.id,
              name: mainLocation.government.name,
              nameAr: mainLocation.government.nameAr,
            }
          : null,
        city: mainLocation?.city
          ? {
              id: mainLocation.city.id,
              name: mainLocation.city.name,
              nameAr: mainLocation.city.nameAr,
            }
          : null,
        rate: worker.rate,
        ratingCount: worker.ratingCount,
        completedJobsCount: worker.completedJobsCount,
        createdAt: worker.createdAt,
      };
    });

    new SuccessResponse(
      'Workers retrieved successfully',
      {
        workers: mappedWorkers,
        ...paginationResult,
      },
      200
    ).send(res);
  });

  getWorkerDetails = asyncHandler(async (req, res) => {
    const workerId = String(req.params.workerId);

    const worker = await prisma.workerProfile.findUnique({
      where: { id: workerId },
      include: {
        user: {
          include: {
            locations: {
              where: { isHidden: false },
              include: {
                government: true,
                city: true,
              },
            },
          },
        },
        verification: true,
        chosenSpecializations: {
          include: {
            specialization: true,
            subSpecialization: true,
          },
        },
        workGovernments: true,
        portfolio: {
          include: {
            projectImages: true,
          },
        },
        daysWorkingHours: true,
      },
    });

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    // Resolve assigned admin if applicable
    let assignedAdmin = null;
    if (worker.verification?.assignedAdminId) {
      assignedAdmin = await prisma.admin.findUnique({
        where: { id: worker.verification.assignedAdminId },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    }

    // Retrieve recent audit logs related to this worker profile
    const auditLogs = await prisma.adminAuditLog.findMany({
      where: {
        OR: [
          { targetType: 'WORKER', targetId: worker.id },
          { targetType: 'VERIFICATION', targetId: worker.verification?.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Map unique main specializations
    const specializationsMap = new Map();
    worker.chosenSpecializations.forEach((cs) => {
      if (!specializationsMap.has(cs.specializationId)) {
        specializationsMap.set(cs.specializationId, {
          id: cs.specialization.id,
          name: cs.specialization.name,
          nameAr: cs.specialization.nameAr,
          subSpecializations: [],
        });
      }
      specializationsMap.get(cs.specializationId).subSpecializations.push({
        id: cs.subSpecialization.id,
        name: cs.subSpecialization.name,
        nameAr: cs.subSpecialization.nameAr,
      });
    });

    const availability = worker.daysWorkingHours.map((dwh) => ({
      day: dwh.day,
      startTime: dwh.startTime,
      endTime: dwh.endTime,
    }));

    const details = {
      workerProfileId: worker.id,
      userId: worker.userId,
      userInfo: {
        firstName: worker.user.firstName,
        middleName: worker.user.middleName,
        lastName: worker.user.lastName,
        phoneNumber: worker.user.phoneNumber,
        profileImageUrl: worker.user.profileImageUrl,
        accountStatus: worker.user.status,
        createdAt: worker.user.createdAt,
      },
      workerInfo: {
        experienceYears: worker.experienceYears,
        bio: worker.bio,
        rate: worker.rate,
        completedJobsCount: worker.completedJobsCount,
        specializations: Array.from(specializationsMap.values()),
        workGovernments: worker.workGovernments.map((wg) => ({
          id: wg.id,
          name: wg.name,
          nameAr: wg.nameAr,
        })),
      },
      verificationInfo: worker.verification
        ? {
            id: worker.verification.id,
            status: worker.verification.status,
            rejectionReasons: worker.verification.rejectionReasons,
            rejectionNote: worker.verification.rejectionNote,
          }
        : {
            status: 'PENDING',
            rejectionReasons: [],
            rejectionNote: null,
          },
      documents: {
        idDocumentUrl: worker.verification?.idDocumentUrl || null,
        idWithPersonalImageUrl: worker.verification?.idWithPersonalImageUrl || null,
      },
      portfolioSummary: {
        projectCount: worker.portfolio?.projectImages.length || 0,
        projectImages:
          worker.portfolio?.projectImages.map((pi) => ({
            id: pi.id,
            imageUrl: pi.imageUrl,
          })) || [],
      },
      availability,
      administrativeInfo: {
        assignedAdmin,
        recentAuditLogs: auditLogs,
      },
    };

    new SuccessResponse('Worker details retrieved successfully', details, 200).send(res);
  });

  approveWorker = asyncHandler(async (req, res) => {
    const workerId = String(req.params.workerId);

    let verification = await prisma.workerVerification.findFirst({
      where: { workerProfileId: workerId },
    });

    if (!verification) {
      verification = await prisma.workerVerification.create({
        data: {
          workerProfileId: workerId,
          status: 'PENDING',
          idWithPersonalImageUrl: 'default_placeholder',
          idDocumentUrl: 'default_placeholder',
        },
      });
    }

    if (verification.status !== 'PENDING') {
      throw new AppError('Only pending verifications can be approved', 400);
    }

    const updated = await prisma.workerVerification.update({
      where: { id: verification.id },
      data: { status: 'APPROVED' },
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState
        ? {
            adminId: req.adminState.adminId,
            username: req.adminState.username,
            role: adminRole,
          }
        : null,
      action: 'WORKER_APPROVED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'INFO',
      targetType: 'WORKER',
      targetId: workerId,
      metadata: null,
    });

    new SuccessResponse('Worker verification approved successfully', updated, 200).send(res);
  });

  rejectWorker = asyncHandler(async (req, res) => {
    const workerId = String(req.params.workerId);
    const body = RejectWorkerSchema.parse(req.body);

    let verification = await prisma.workerVerification.findFirst({
      where: { workerProfileId: workerId },
    });

    if (!verification) {
      verification = await prisma.workerVerification.create({
        data: {
          workerProfileId: workerId,
          status: 'PENDING',
          idWithPersonalImageUrl: 'default_placeholder',
          idDocumentUrl: 'default_placeholder',
        },
      });
    }

    if (verification.status !== 'PENDING') {
      throw new AppError('Only pending verifications can be rejected', 400);
    }

    // Set connection for rejection reasons
    const updated = await prisma.workerVerification.update({
      where: { id: verification.id },
      data: {
        status: 'REJECTED',
        rejectionReasons: body.rejectionReasons,
        rejectionNote: body.rejectionNote || null,
      },
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState
        ? {
            adminId: req.adminState.adminId,
            username: req.adminState.username,
            role: adminRole,
          }
        : null,
      action: 'WORKER_REJECTED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'WARNING',
      targetType: 'WORKER',
      targetId: workerId,
      metadata: { rejectionReasons: body.rejectionReasons, rejectionNote: body.rejectionNote },
    });

    new SuccessResponse('Worker verification rejected successfully', updated, 200).send(res);
  });

  suspendWorker = asyncHandler(async (req, res) => {
    const workerId = String(req.params.workerId);
    const body = SuspendWorkerSchema.parse(req.body);

    const worker = await prisma.workerProfile.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: worker.userId },
      data: { status: 'SUSPENDED' },
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState
        ? {
            adminId: req.adminState.adminId,
            username: req.adminState.username,
            role: adminRole,
          }
        : null,
      action: 'WORKER_SUSPENDED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'WARNING',
      targetType: 'WORKER',
      targetId: workerId,
      metadata: { reason: body.reason },
    });

    new SuccessResponse('Worker suspended successfully', updatedUser, 200).send(res);
  });

  reactivateWorker = asyncHandler(async (req, res) => {
    const workerId = String(req.params.workerId);

    const worker = await prisma.workerProfile.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: worker.userId },
      data: { status: 'ACTIVE' },
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState
        ? {
            adminId: req.adminState.adminId,
            username: req.adminState.username,
            role: adminRole,
          }
        : null,
      action: 'WORKER_REACTIVATED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'INFO',
      targetType: 'WORKER',
      targetId: workerId,
      metadata: null,
    });

    new SuccessResponse('Worker reactivated successfully', updatedUser, 200).send(res);
  });

  banWorker = asyncHandler(async (req, res) => {
    const workerId = String(req.params.workerId);
    const body = SuspendWorkerSchema.parse(req.body); // uses reason string

    const worker = await prisma.workerProfile.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: worker.userId },
      data: { status: 'BANNED' },
    });

    // Revoke all sessions for the banned worker
    const adminId = req.adminState?.adminId ?? 'system';
    await sessionRepository.revokeMany({
      filter: { userId: worker.userId },
      revokedBy: adminId,
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState
        ? {
            adminId: req.adminState.adminId,
            username: req.adminState.username,
            role: adminRole,
          }
        : null,
      action: 'WORKER_BANNED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'CRITICAL',
      targetType: 'WORKER',
      targetId: workerId,
      metadata: { reason: body.reason },
    });

    new SuccessResponse('Worker banned successfully', updatedUser, 200).send(res);
  });

  createWorker = asyncHandler(async (req, res) => {
    const body = ManualWorkerCreateSchema.parse(req.body);
    const {
      firstName,
      middleName,
      lastName,
      phoneNumber,
      governmentId,
      cityId,
      specializationIds,
    } = body;

    // Check if phone number already exists
    const existingUser = await prisma.user.findFirst({
      where: { phoneNumber },
    });

    if (existingUser) {
      throw new AppError('Phone number already registered', 409);
    }

    // Resolve lat/long from city/government
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    const gov = await prisma.government.findUnique({ where: { id: governmentId } });
    const lat = city?.lat ?? gov?.lat ?? 30.0444;
    const long = city?.long ?? gov?.long ?? 31.2357;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          firstName,
          middleName: middleName || '',
          lastName,
          phoneNumber,
          status: 'ACTIVE',
          role: 'USER',
        },
      });

      // 2. Create WorkerProfile
      const workerProfile = await tx.workerProfile.create({
        data: {
          userId: user.id,
          experienceYears: 0,
          isInTeam: false,
          acceptsUrgentJobs: false,
          rate: -1.0,
          ratingCount: 0,
          completedJobsCount: 0,
        },
      });

      // 3. Create WorkerVerification
      const verification = await tx.workerVerification.create({
        data: {
          workerProfileId: workerProfile.id,
          idDocumentUrl: 'manual_onboarding',
          idWithPersonalImageUrl: 'manual_onboarding',
          status: 'APPROVED',
          reason: 'Manually created by admin',
        },
      });

      // 4. Link selected main specializations with all their sub-specializations
      const subSpecializations = await tx.subSpecialization.findMany({
        where: { mainSpecializationId: { in: specializationIds } },
      });

      if (subSpecializations.length > 0) {
        await tx.chosenSpecialization.createMany({
          data: subSpecializations.map((subSpec) => ({
            workerProfileId: workerProfile.id,
            specializationId: subSpec.mainSpecializationId,
            subSpecializationId: subSpec.id,
          })),
        });
      }

      // 5. Connect work governments
      await tx.workerProfile.update({
        where: { id: workerProfile.id },
        data: {
          workGovernments: {
            connect: [{ id: governmentId }],
          },
        },
      });

      return { user, workerProfile, verification };
    });

    // 6. Create primary location via raw query wrapper in userRepository
    const location = await userRepository.addLocation({
      userId: result.user.id,
      location: {
        governmentId,
        cityId,
        address: 'Cairo, Egypt',
        addressNotes: 'Admin Created Worker Location',
        long,
        lat,
        isMain: true,
      },
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState
        ? {
            adminId: req.adminState.adminId,
            username: req.adminState.username,
            role: adminRole,
          }
        : null,
      action: 'WORKER_CREATED_BY_ADMIN',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'WARNING',
      targetType: 'WORKER',
      targetId: result.workerProfile.id,
      metadata: { firstName, lastName, phoneNumber },
    });

    new SuccessResponse(
      'Worker profile manually created successfully',
      {
        user: result.user,
        workerProfile: result.workerProfile,
        verification: result.verification,
        location,
      },
      201
    ).send(res);
  });
}
